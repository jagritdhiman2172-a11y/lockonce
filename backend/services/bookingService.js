const db = require("../config/db");

async function getSeatMap(eventId) {
    const result = await db.query(
        `SELECT id, seat_number, status
         FROM seats
         WHERE event_id = $1
         ORDER BY seat_number`,
        [eventId]
    );

    return result.rows;
}

async function holdSeats(userId, eventId, seatIds) {
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new Error("Select at least one seat");
    }

    if (new Set(seatIds).size !== seatIds.length) {
        throw new Error("Duplicate seats are not allowed");
    }

    if (seatIds.length > 10) {
    throw new Error("You can hold a maximum of 10 seats per booking");
}

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Lock event to serialize booking operations for this event
        const eventResult = await client.query(
            `SELECT id, event_date, status
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            throw new Error("Event not found");
        }

        const event = eventResult.rows[0];

        if (event.status !== "published") {
            throw new Error("Event is not available");
        }

        if (new Date(event.event_date) <= new Date()) {
            throw new Error("Booking is closed");
        }

        // Expire old holds
        await client.query(
            `UPDATE seats
             SET status = 'available'
             WHERE id IN (
                 SELECT hs.seat_id
                 FROM hold_seats hs
                 JOIN holds h ON h.id = hs.hold_id
                 WHERE h.event_id = $1
                   AND h.status = 'active'
                   AND h.expires_at <= NOW()
             )`,
            [eventId]
        );

        await client.query(
            `UPDATE holds
             SET status = 'expired'
             WHERE event_id = $1
               AND status = 'active'
               AND expires_at <= NOW()`,
            [eventId]
        );

        // Release this user's previous active hold
        await client.query(
            `UPDATE seats
             SET status = 'available'
             WHERE id IN (
                 SELECT hs.seat_id
                 FROM hold_seats hs
                 JOIN holds h ON h.id = hs.hold_id
                 WHERE h.user_id = $1
                   AND h.event_id = $2
                   AND h.status = 'active'
             )`,
            [userId, eventId]
        );

        await client.query(
            `UPDATE holds
             SET status = 'cancelled'
             WHERE user_id = $1
               AND event_id = $2
               AND status = 'active'`,
            [userId, eventId]
        );

       

        // Lock requested seats in stable ID order
        const seatsResult = await client.query(
            `SELECT id, status
             FROM seats
             WHERE event_id = $1
               AND id = ANY($2::int[])
             ORDER BY id
             FOR UPDATE`,
            [eventId, seatIds]
        );

        if (seatsResult.rows.length !== seatIds.length) {
            throw new Error("One or more seats are invalid");
        }

        if (seatsResult.rows.some(seat => seat.status !== "available")) {
            throw new Error("One or more seats are unavailable");
        }

        // Create a 5-minute hold
        const holdResult = await client.query(
            `INSERT INTO holds (user_id, event_id, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
             RETURNING *`,
            [userId, eventId]
        );

        const hold = holdResult.rows[0];

        for (const seatId of seatIds) {
            await client.query(
                `INSERT INTO hold_seats (hold_id, seat_id)
                 VALUES ($1, $2)`,
                [hold.id, seatId]
            );
        }

        await client.query(
            `UPDATE seats
             SET status = 'held'
             WHERE id = ANY($1::int[])`,
            [seatIds]
        );

        await client.query("COMMIT");

        return hold;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function confirmHold(userId, holdId) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Find the hold and its event
        const holdInfo = await client.query(
            `SELECT event_id
             FROM holds
             WHERE id = $1 AND user_id = $2`,
            [holdId, userId]
        );

        if (holdInfo.rows.length === 0) {
            throw new Error("Hold not found");
        }

        const eventId = holdInfo.rows[0].event_id;

        // Lock event first
        const eventResult = await client.query(
            `SELECT id, event_date, status
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        );

        const event = eventResult.rows[0];

        if (event.status !== "published" ||
            new Date(event.event_date) <= new Date()) {
            throw new Error("Booking is closed");
        }

        // Lock hold
        const holdResult = await client.query(
            `SELECT *
             FROM holds
             WHERE id = $1 AND user_id = $2
             FOR UPDATE`,
            [holdId, userId]
        );

        const hold = holdResult.rows[0];

        if (hold.status !== "active" ||
            new Date(hold.expires_at) <= new Date()) {
            throw new Error("Hold has expired or is no longer active");
        }

        // Lock held seats in stable order
        const seatsResult = await client.query(
            `SELECT s.id
             FROM hold_seats hs
             JOIN seats s ON s.id = hs.seat_id
             WHERE hs.hold_id = $1
             ORDER BY s.id
             FOR UPDATE OF s`,
            [holdId]
        );

        if (seatsResult.rows.length === 0) {
            throw new Error("No seats found in this hold");
        }

        const seatIds = seatsResult.rows.map(seat => seat.id);

        // Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings (user_id, event_id, status)
             VALUES ($1, $2, 'confirmed')
             RETURNING *`,
            [userId, eventId]
        );

        const booking = bookingResult.rows[0];

        // Add seats to booking
        for (const seatId of seatIds) {
            await client.query(
                `INSERT INTO booking_seats
                 (booking_id, seat_id, status)
                 VALUES ($1, $2, 'confirmed')`,
                [booking.id, seatId]
            );
        }

        // Update seat status
        await client.query(
            `UPDATE seats
             SET status = 'booked'
             WHERE id = ANY($1::int[])`,
            [seatIds]
        );

        // Confirm hold
        await client.query(
            `UPDATE holds
             SET status = 'confirmed'
             WHERE id = $1`,
            [holdId]
        );

        // Write audit record in the same transaction
        const shard = Math.abs(Number(eventId)) % 4;

        await client.query(
            `INSERT INTO audit_logs_${shard}
             (event_id, actor_id, action, details)
             VALUES ($1, $2, $3, $4)`,
            [
                eventId,
                userId,
                "BOOKING_CONFIRMED",
                JSON.stringify({ bookingId: booking.id, seatIds })
            ]
        );

        await client.query("COMMIT");

        return booking;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function cancelBooking(userId, bookingId) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const bookingInfo = await client.query(
            `SELECT event_id
             FROM bookings
             WHERE id = $1 AND user_id = $2`,
            [bookingId, userId]
        );

        if (bookingInfo.rows.length === 0) {
            throw new Error("Booking not found");
        }

        const eventId = bookingInfo.rows[0].event_id;

        await client.query(
            `SELECT id FROM events
             WHERE id = $1 FOR UPDATE`,
            [eventId]
        );

        const bookingResult = await client.query(
            `SELECT *
             FROM bookings
             WHERE id = $1 AND user_id = $2
             FOR UPDATE`,
            [bookingId, userId]
        );

        const booking = bookingResult.rows[0];

        if (booking.status !== "confirmed") {
            throw new Error("Booking is already cancelled");
        }

        const seatsResult = await client.query(
            `SELECT seat_id
             FROM booking_seats
             WHERE booking_id = $1
             AND status = 'confirmed'
             ORDER BY seat_id
             FOR UPDATE`,
            [bookingId]
        );

        const seatIds = seatsResult.rows.map(row => row.seat_id);

        await client.query(
            `UPDATE booking_seats
             SET status = 'cancelled'
             WHERE booking_id = $1`,
            [bookingId]
        );

        await client.query(
            `UPDATE bookings
             SET status = 'cancelled'
             WHERE id = $1`,
            [bookingId]
        );

        await client.query(
            `UPDATE seats
             SET status = 'available'
             WHERE id = ANY($1::int[])`,
            [seatIds]
        );

        const shard = Math.abs(Number(eventId)) % 4;

        await client.query(
            `INSERT INTO audit_logs_${shard}
             (event_id, actor_id, action, details)
             VALUES ($1, $2, $3, $4)`,
            [
                eventId,
                userId,
                "BOOKING_CANCELLED",
                JSON.stringify({ bookingId, seatIds })
            ]
        );

        await client.query("COMMIT");

        return { message: "Booking cancelled successfully" };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
async function listMyBookings(userId) {
    const result = await db.query(
        `SELECT
            b.id AS booking_id,
            b.event_id,
            e.title AS event_title,
            e.venue,
            e.event_date,
            b.status,
            b.checked_in,
            b.created_at,
            ARRAY_AGG(s.seat_number ORDER BY s.seat_number)
                FILTER (WHERE bs.status = 'confirmed') AS seats
         FROM bookings b
         JOIN events e ON e.id = b.event_id
         LEFT JOIN booking_seats bs ON bs.booking_id = b.id
         LEFT JOIN seats s ON s.id = bs.seat_id
         WHERE b.user_id = $1
         GROUP BY b.id, e.id
         ORDER BY b.created_at DESC`,
        [userId]
    );

    return result.rows;
}

async function verifyBooking(bookingId) {
    const crypto = require("crypto");
    const result = await db.query(
        `SELECT
            b.id AS booking_id,
            b.user_id,
            b.event_id,
            b.status,
            b.checked_in,
            b.created_at,
            u.name AS attendee_name,
            u.email AS attendee_email,
            e.title AS event_title,
            e.venue,
            e.event_date,
            ARRAY_AGG(s.seat_number ORDER BY s.seat_number)
                FILTER (WHERE bs.status = 'confirmed') AS seats
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN events e ON e.id = b.event_id
         LEFT JOIN booking_seats bs ON bs.booking_id = b.id
         LEFT JOIN seats s ON s.id = bs.seat_id
         WHERE b.id = $1
         GROUP BY b.id, u.id, e.id`,
        [bookingId]
    );

    if (result.rows.length === 0) {
        throw new Error("Ticket not found or invalid booking reference");
    }

    const booking = result.rows[0];
    const rawData = `${booking.booking_id}-${booking.event_id}-${booking.user_id}-${booking.created_at}`;
    const hash = crypto.createHash("sha256").update(rawData).digest("hex").slice(0, 20).toUpperCase();
    const verificationCode = `LOCK-QC-${hash}`;

    return {
        isValid: booking.status === "confirmed",
        bookingId: booking.booking_id,
        status: booking.status,
        checkedIn: !!booking.checked_in,
        verificationCode,
        attendeeName: booking.attendee_name,
        attendeeEmail: booking.attendee_email,
        eventTitle: booking.event_title,
        venue: booking.venue,
        eventDate: booking.event_date,
        seats: booking.seats || [],
        verifiedAt: new Date().toISOString()
    };
}
async function listEventBookings(eventId, organizerId, role) {

    // Check whether the event exists and who owns it
    const eventCheck = await db.query(
        `SELECT organizer_id FROM events WHERE id = $1`,
        [eventId]
    );

    if (eventCheck.rows.length === 0) {
        throw new Error("Event not found");
    }

    // Verify event ownership
    if (
        role !== "admin" &&
        Number(eventCheck.rows[0].organizer_id) !== Number(organizerId)
    ) {
        throw new Error("You cannot view attendees for this event");
    }

    // Fetch confirmed attendees only
    const result = await db.query(
        `SELECT
            b.id AS booking_id,
            u.name,
            u.email,
            b.status,
            b.checked_in,
            ARRAY_AGG(s.seat_number ORDER BY s.seat_number)
                FILTER (WHERE bs.status = 'confirmed') AS seats
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         LEFT JOIN booking_seats bs ON bs.booking_id = b.id
         LEFT JOIN seats s ON s.id = bs.seat_id
         WHERE b.event_id = $1
         AND b.status = 'confirmed'
         GROUP BY b.id, u.id
         ORDER BY b.created_at DESC`,
        [eventId]
    );

    return result.rows;
}
async function checkIn(bookingId, organizerId, role) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT b.*, e.organizer_id
             FROM bookings b
             JOIN events e ON e.id = b.event_id
             WHERE b.id = $1
             FOR UPDATE OF b, e`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            throw new Error("Booking not found");
        }

        const booking = result.rows[0];

        if (
            role !== "admin" &&
            Number(booking.organizer_id) !== Number(organizerId)
        ) {
            throw new Error("You cannot check in this attendee");
        }

        if (booking.status !== "confirmed") {
            throw new Error("Only confirmed bookings can be checked in");
        }

        if (booking.checked_in) {
            throw new Error("Attendee is already checked in");
        }

        await client.query(
            `UPDATE bookings
             SET checked_in = TRUE
             WHERE id = $1`,
            [bookingId]
        );

        await client.query("COMMIT");

        return { message: "Attendee checked in successfully" };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
module.exports = {
    getSeatMap,
    holdSeats,
    confirmHold,
    cancelBooking,
    listMyBookings,
    listEventBookings,
    checkIn,
    verifyBooking
};
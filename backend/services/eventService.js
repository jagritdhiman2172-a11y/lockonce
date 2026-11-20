const db = require("../config/db");

// Get all published events
async function getPublishedEvents() {
    const result = await db.query(`
        SELECT e.*, u.name AS organizer_name
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.status = 'published'
        ORDER BY e.event_date ASC
    `);

    return result.rows;
}

// Get events created by a specific organizer
async function getOrganizerEvents(organizerId) {
    const result = await db.query(
        `SELECT *
         FROM events
         WHERE organizer_id = $1
         ORDER BY created_at DESC`,
        [organizerId]
    );

    return result.rows;
}
// Get event details and its seat map (allows previewing any active or draft arena)
async function getSeatMap(eventId) {
    const eventResult = await db.query(
        `SELECT *
         FROM events
         WHERE id = $1`,
        [eventId]
    );

    if (eventResult.rows.length === 0) {
        throw new Error("Event not found");
    }

    const seatResult = await db.query(
        `SELECT id, seat_number, status
         FROM seats
         WHERE event_id = $1
         ORDER BY id ASC`,
        [eventId]
    );

    return {
        event: eventResult.rows[0],
        seats: seatResult.rows
    };
}
// Create an event
async function createEvent(organizerId, data) {
    const { title, description, venue, eventDate, totalSeats } = data;

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const eventResult = await client.query(
            `INSERT INTO events
            (organizer_id, title, description, venue, event_date, status)
            VALUES ($1, $2, $3, $4, $5, 'published')
            RETURNING *`,
            [organizerId, title, description, venue, eventDate]
        );

        const event = eventResult.rows[0];

        // Generate Multi-Tier Seating Grid (Rows A-G)
        const rowLetters = ["A", "B", "C", "D", "E", "F", "G"];
        const seatsToCreate = totalSeats || 70;
        let created = 0;

        for (let r = 0; r < rowLetters.length && created < seatsToCreate; r++) {
            for (let num = 1; num <= 10 && created < seatsToCreate; num++) {
                const seatNum = `${rowLetters[r]}${String(num).padStart(2, "0")}`;
                await client.query(
                    `INSERT INTO seats (event_id, seat_number, status)
                     VALUES ($1, $2, 'available')
                     ON CONFLICT DO NOTHING`,
                    [event.id, seatNum]
                );
                created++;
            }
        }

        // If extra seats requested beyond 70, fill additional rows
        while (created < seatsToCreate) {
            const extraRow = String.fromCharCode(72 + Math.floor(created / 10));
            const extraNum = (created % 10) + 1;
            const seatNum = `${extraRow}${String(extraNum).padStart(2, "0")}`;
            await client.query(
                `INSERT INTO seats (event_id, seat_number, status)
                 VALUES ($1, $2, 'available')
                 ON CONFLICT DO NOTHING`,
                [event.id, seatNum]
            );
            created++;
        }

        await client.query("COMMIT");

        return event;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Publish an event
async function publishEvent(eventId, userId, role) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT * FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        );

        if (result.rows.length === 0) {
            throw new Error("Event not found");
        }

        const event = result.rows[0];

        if (role !== "admin" && Number(event.organizer_id) !== Number(userId)) {
            throw new Error("You cannot publish this event");
        }

        if (event.status !== "draft") {
            throw new Error("Only draft events can be published");
        }

        const updated = await client.query(
            `UPDATE events
             SET status = 'published'
             WHERE id = $1
             RETURNING *`,
            [eventId]
        );

        await client.query("COMMIT");

        return updated.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getPublishedEvents,
    getOrganizerEvents,
    getSeatMap,
    createEvent,
    publishEvent
};
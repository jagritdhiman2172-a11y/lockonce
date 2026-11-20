const express = require("express");
const router = express.Router();
const {
    getSeatMap,
    holdSeats,
    confirmHold,
    cancelBooking,
    listMyBookings,
    listEventBookings,
    checkIn,
    verifyBooking
} = require("../services/bookingService");

const { requireAuth, requireRole } = require("../middleware/auth");

// View seat map
router.get("/seats/:eventId", requireAuth, async (req, res) => {
    try {
        const seats = await getSeatMap(req.params.eventId);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hold selected seats
router.post("/hold", requireAuth, async (req, res) => {
    try {
        const { eventId, seatIds } = req.body;

        const hold = await holdSeats(
            req.session.user.id,
            eventId,
            seatIds
        );

        res.status(201).json({
            message: "Seats held for 5 minutes",
            hold
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Confirm hold
router.post("/confirm", requireAuth, async (req, res) => {
    try {
        const booking = await confirmHold(
            req.session.user.id,
            req.body.holdId
        );

        res.json({
            message: "Booking confirmed",
            booking
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel booking
router.post("/cancel", requireAuth, async (req, res) => {
    try {
        const result = await cancelBooking(
            req.session.user.id,
            req.body.bookingId
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// View my bookings
router.get("/my-bookings", requireAuth, async (req, res) => {
    try {
        const bookings = await listMyBookings(req.session.user.id);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Organizer views attendees for an event
router.get("/event/:eventId/attendees", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
    try {
        const attendees = await listEventBookings(
            req.params.eventId,
            req.session.user.id,
            req.session.user.role
        );
        res.json(attendees);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Check in an attendee
router.post(
    "/check-in",
    requireAuth,
    requireRole("organizer", "admin"),
    async (req, res) => {
        try {
            const result = await checkIn(
                req.body.bookingId,
                req.session.user.id,
                req.session.user.role
            );

            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Verify ticket authenticity & details (Public or Authenticated)
router.get("/verify/:bookingId", async (req, res) => {
    try {
        const verification = await verifyBooking(req.params.bookingId);
        res.json(verification);
    } catch (error) {
        res.status(404).json({ message: error.message, isValid: false });
    }
});

router.post("/verify", async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID is required", isValid: false });
        }
        const verification = await verifyBooking(bookingId);
        res.json(verification);
    } catch (error) {
        res.status(404).json({ message: error.message, isValid: false });
    }
});

module.exports = router;
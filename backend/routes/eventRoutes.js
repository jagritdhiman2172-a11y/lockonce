const express = require("express");
const router = express.Router();
const {
    getPublishedEvents,
    getOrganizerEvents,
    getSeatMap,
    createEvent,
    publishEvent
} = require("../services/eventService");
const { requireAuth, requireRole } = require("../middleware/auth");

// View published events
router.get("/", requireAuth, async (req, res) => {
    try {
        const events = await getPublishedEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
       }
});

// Get events created by the logged-in organizer
router.get(
    "/my-events",
    requireAuth,
    requireRole("organizer", "admin"),
    async (req, res) => {
        try {
            const events = await getOrganizerEvents(
                req.session.user.id
            );

            res.json(events);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);
// Get seat map for a published event
router.get("/:id/seats", requireAuth, async (req, res) => {
    try {
        const seatMap = await getSeatMap(req.params.id);
        res.json(seatMap);
    } catch (error) {
        const status =
            (error.message === "Event not found" || error.message === "Published event not found") ? 404 : 500;

        res.status(status).json({
            message: error.message
        });
    }
});
// Organizer creates an event
// Organizer creates an event
router.post(
    "/",
    requireAuth,
    requireRole("organizer", "admin"),
    async (req, res) => {
        try {
            const event = await createEvent(
                req.session.user.id,
                req.body
            );

            res.status(201).json({
                message: "Event created successfully",
                event
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Publish an event
router.patch(
    "/:id/publish",
    requireAuth,
    requireRole("organizer", "admin"),
    async (req, res) => {
        try {
            const event = await publishEvent(
                req.params.id,
                req.session.user.id,
                req.session.user.role
            );

            res.json({
                message: "Event published successfully",
                event
            });

        } catch (error) {
            const status =
                error.message === "Event not found" ? 404 :
                error.message.includes("cannot publish") ? 403 :
                400;

            res.status(status).json({
                message: error.message
            });
        }
    }
);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../services/authService");

// User registration (Student or Organizer)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const validRole = (role === "organizer") ? "organizer" : "student";

        const user = await registerUser(
            name.trim(),
            email.trim().toLowerCase(),
            password,
            validRole
        );

        res.status(201).json({
            message: "Registration successful",
            user
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await loginUser(
            email.trim().toLowerCase(),
            password
        );

        req.session.user = user;

        res.json({
            message: "Login successful",
            user
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
});

// Logout
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully"
        });
    });
});

module.exports = router;
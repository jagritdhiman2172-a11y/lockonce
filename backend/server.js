const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const express = require("express");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const app = express();

// Trust Render's proxy for secure session cookies
app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://lockonce-a3son7xjw-jagrit9.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

// Session configuration
app.use(session({
    store: new pgSession({
        pool: db,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/events", require("./routes/eventRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));

// Static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
    res.send("LOCKONCE SERVER IS RUNNING!");
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      status: "success",
      message: "LockOnce backend and database are working",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("DATABASE HEALTH CHECK ERROR:", error);

    res.status(500).json({
      status: "error",
      message: error.message || "Unknown database error",
      code: error.code || "UNKNOWN"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`LockOnce running on port ${PORT}`);
});
const cors = require("cors");

const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const express = require("express");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to prevent port mismatch blocking
  },
  credentials: true
}));
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
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", require("./routes/authRoutes"));
app.use("/events", require("./routes/eventRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("SEATLOCK SERVER IS RUNNING!");
});

app.get("/health", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");

        res.json({
            status: "success",
            message: "SeatLock backend and database are working",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SeatLock running at http://localhost:${PORT}`);
});
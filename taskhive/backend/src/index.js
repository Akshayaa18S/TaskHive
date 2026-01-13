require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* ============================
   ✅ CORS CONFIG (PRODUCTION SAFE)
=============================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-hive-khaki.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

/* ============================
   ✅ MIDDLEWARE
=============================== */

app.use(express.json());

/* ============================
   ✅ ROUTES
=============================== */

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/tasks", taskRoutes);

/* ============================
   ✅ HEALTH CHECK (Railway needs this)
=============================== */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TaskHive API is running 🚀",
  });
});

/* ============================
   ✅ START SERVER (Railway compatible)
=============================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server running on port ${PORT}`);
});

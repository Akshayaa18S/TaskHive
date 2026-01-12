require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS (safe for now, can restrict later)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/tasks", taskRoutes);

// ✅ Health check (VERY IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.status(200).json({ message: "TaskHive API is running 🚀" });
});

// ✅ MUST listen on 0.0.0.0 for Railway
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server running on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Basic middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// ❌ ROUTES DISABLED (IMPORTANT)
// ❌ Commenting these proves whether Prisma / DB is crashing Railway
// const authRoutes = require("./routes/authRoutes");
// const groupRoutes = require("./routes/groupRoutes");
// const taskRoutes = require("./routes/taskRoutes");

// app.use("/auth", authRoutes);
// app.use("/groups", groupRoutes);
// app.use("/tasks", taskRoutes);

// ✅ HEALTH CHECK ONLY
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TaskHive backend is alive 🚀",
  });
});

// ✅ MUST bind to 0.0.0.0 for Railway
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

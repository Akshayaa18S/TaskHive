require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ❌ TEMPORARILY DISABLED
// const authRoutes = require("./routes/authRoutes");
// const groupRoutes = require("./routes/groupRoutes");
// const taskRoutes = require("./routes/taskRoutes");

// app.use("/auth", authRoutes);
// app.use("/groups", groupRoutes);
// app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "TaskHive API is running 🚀" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("✓ Server running on port", PORT);
});

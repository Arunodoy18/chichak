const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date() });
});

// Routes
const reservationsRouter = require("./routes/reservations");
app.use("/api/reservations", reservationsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Server Error" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err.message);
});

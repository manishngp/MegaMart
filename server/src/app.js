import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running successfully 🚀",
  });
});

export default app;
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";


import errorMiddleware from "./middleware/errorMiddleware.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running successfully",
  });
});

// Error Handler (Always Last)
app.use(errorMiddleware);

export default app;



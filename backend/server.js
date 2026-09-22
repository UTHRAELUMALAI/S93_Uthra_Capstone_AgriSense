const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const CropPrice = require("./models/CropPrice");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AgriSense API is running",
  });
});

// WRITE - Add crop price
app.post("/api/crop-prices", async (req, res) => {
  try {
    const cropPrice = await CropPrice.create(req.body);

    res.status(201).json(cropPrice);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// READ - Get all crop prices
app.get("/api/crop-prices", async (req, res) => {
  try {
    const cropPrices = await CropPrice.find();

    res.json(cropPrices);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });
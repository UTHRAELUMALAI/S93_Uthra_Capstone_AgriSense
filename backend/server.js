const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const CropPrice = require("./models/CropPrice");
const Market = require("./models/Market");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AgriSense API is running",
  });
});

// GET - Get all markets
app.get("/api/markets", async (req, res) => {
  try {

    const markets = await Market.find();

    res.json(markets);
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    res.status(500).json({
      message: "Failed to fetch markets",
    });
  }
});

// POST - Create a market
app.post("/api/markets", async (req, res) => {
  try {
    const market = new Market(req.body);

    const savedMarket = await market.save();

    res.status(201).json(savedMarket);
  } catch (error) {
    console.error("Failed to create market:", error);
    res.status(500).json({
      message: "Failed to create market",
    });
  }
});

// POST - Add crop price
app.post("/api/crop-prices", async (req, res) => {
  try {
    const cropPrice = await CropPrice.create(req.body);

    res.status(201).json(cropPrice);
  } catch (error) {
    console.error("Failed to create crop price:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

// GET - Get all crop prices with Market relationship
app.get("/api/crop-prices", async (req, res) => {
  try {
    const cropPrices = await CropPrice.find().populate("marketId");

    res.json(cropPrices);
  } catch (error) {
    console.error("Failed to fetch crop prices:", error);

    res.status(500).json({
      message: "Failed to fetch crop prices",
    });
  }
});

// PUT - Update crop price
app.put("/api/crop-prices/:id", async (req, res) => {
  try {
    const updatedCropPrice = await CropPrice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCropPrice) {
      return res.status(404).json({
        message: "Crop price not found",
      });
    }

    res.json(updatedCropPrice);
  } catch (error) {
    console.error("Failed to update crop price:", error);

    res.status(500).json({
      message: "Failed to update crop price",
    });
  }
});

app.delete("/api/crop-prices/:id", async (req, res) => {
  try {
    const deletedCropPrice = await CropPrice.findByIdAndDelete(req.params.id);

    if (!deletedCropPrice) {
      return res.status(404).json({
        message: "Crop price not found",
      });
    }

    res.json({
      message: "Crop price deleted successfully",
      deletedCropPrice,
    });
  } catch (error) {
    console.error("Failed to delete crop price:", error);
    res.status(500).json({
      message: "Failed to delete crop price",
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
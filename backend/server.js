const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const CropPrice = require("./models/CropPrice");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AgriSense API is running",
  });
});



// READ - Get all crop prices
app.get("/api/crop-prices", async (req, res) => {
  try {
    const cropPrices = await CropPrice.find();

    res.json(cropPrices);
  } catch (error) {
    console.error("Failed to fetch crop prices:", error);
    res.status(500).json({
      message: "Failed to fetch crop prices",
    });
  }
});
app.post("/api/crop-prices", async (req, res) => {
  try {
    const cropPrice = await CropPrice.create(req.body);
    res.status(201).json(cropPrice);
  } catch (error) {
    console.error("Failed to create crop price:", error);
    res.status(500).json({
      message: "Failed to create crop price",
    });
  }
});

app.put("/api/crop-prices/:id", async (req, res) => {
  try {
    const updatedCropPrice = await CropPrice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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
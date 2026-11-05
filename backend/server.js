const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const CropPrice = require("./models/CropPrice");
const Market = require("./models/Market");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// ROOT API
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "AgriSense API is running",
  });
});

// =========================
// MARKET APIs
// =========================

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

// =========================
// CROP PRICE APIs
// =========================

// POST - Add crop price
app.post("/api/crop-prices", authMiddleware, async (req, res) => {
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
    // Check if marketId is provided
    if (!req.body.marketId) {
      return res.status(400).json({
        message: "marketId is required",
      });
    }

    // Check if the referenced market exists
    const market = await Market.findById(req.body.marketId);

    if (!market) {
      return res.status(404).json({
        message: "Referenced market not found",
      });
    }

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

    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE - Delete crop price
app.delete("/api/crop-prices/:id", async (req, res) => {
  try {
    const deletedCropPrice = await CropPrice.findByIdAndDelete(
      req.params.id
    );

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

// =========================
// AUTHENTICATION APIs
// =========================

// POST - Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username and password
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Registration failed:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// POST - Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username and password
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB connection failed:",
      error.message
    );
  });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const { Readable } = require("stream");

require("dotenv").config({ path: __dirname + "/.env" });

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("./models/User");
const CropPrice = require("./models/CropPrice");
const Market = require("./models/Market");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// Multer configuration for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

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

// =========================
// CSV FILE UPLOAD
// =========================

// POST - Upload crop prices using CSV file
app.post(
  "/api/crop-prices/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a CSV file",
        });
      }

      const rows = [];

      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", async () => {
          try {
            if (rows.length === 0) {
              return res.status(400).json({
                message: "CSV file is empty",
              });
            }

            const cropPrices = [];

            for (const row of rows) {
              const crop = row.crop?.trim();
              const district = row.district?.trim();
              const market = row.market?.trim();
              const price = Number(row.price);
              const unit = row.unit?.trim();
              const date = new Date(row.date);

              if (
                !crop ||
                !district ||
                !market ||
                !unit ||
                Number.isNaN(price) ||
                Number.isNaN(date.getTime())
              ) {
                return res.status(400).json({
                  message:
                    "Invalid CSV data. Required columns: crop, district, market, price, unit, date",
                });
              }

              const existingMarket = await Market.findOne({
                name: market,
                district: district,
              });

              const cropPriceData = {
                crop,
                district,
                market,
                price,
                unit,
                date,
              };

              if (existingMarket) {
                cropPriceData.marketId = existingMarket._id;
              }

              cropPrices.push(cropPriceData);
            }

            const savedCropPrices =
              await CropPrice.insertMany(cropPrices);

            res.status(201).json({
              message: "CSV file uploaded successfully",
              recordsUploaded: savedCropPrices.length,
              data: savedCropPrices,
            });
          } catch (error) {
            console.error("Failed to process CSV:", error);

            res.status(500).json({
              message: "Failed to process CSV file",
              error: error.message,
            });
          }
        })
        .on("error", (error) => {
          console.error("CSV parsing failed:", error);

          res.status(400).json({
            message: "Failed to read CSV file",
            error: error.message,
          });
        });
    } catch (error) {
      console.error("File upload failed:", error);

      res.status(500).json({
        message: "File upload failed",
        error: error.message,
      });
    }
  }
);

// =========================
// PUT - Update crop price
// =========================

app.put("/api/crop-prices/:id", async (req, res) => {
  try {
    if (!req.body.marketId) {
      return res.status(400).json({
        message: "marketId is required",
      });
    }

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

// =========================
// DELETE - Delete crop price
// =========================

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

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "This account uses Google login",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

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
// GOOGLE AUTHENTICATION
// =========================

// POST - Google Login
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    if (!googleId || !email) {
      return res.status(400).json({
        message: "Invalid Google account information",
      });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        username: email,
        email: email,
        name: name || email,
        googleId: googleId,
      });
    } else {
      user.googleId = googleId;

      if (!user.email) {
        user.email = email;
      }

      if (!user.name) {
        user.name = name || email;
      }

      await user.save();
    }

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
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Google login failed:", error);

    res.status(401).json({
      message: "Google authentication failed",
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

    app
      .listen(5000, "127.0.0.1", () => {
        console.log(
          "Server running on http://127.0.0.1:5000"
        );
      })
      .on("error", (error) => {
        console.error("SERVER ERROR:", error);
      });
  })
  .catch((error) => {
    console.log(
      "MongoDB connection failed:",
      error.message
    );
  });
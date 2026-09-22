const mongoose = require("mongoose");

const cropPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    market: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CropPrice = mongoose.model("CropPrice", cropPriceSchema);

module.exports = CropPrice;
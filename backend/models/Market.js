const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Market", marketSchema);
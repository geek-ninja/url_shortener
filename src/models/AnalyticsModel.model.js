const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true },

    totalClicks: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },

    clicksByDate: [
      {
        date: { type: Date, required: true },
        clickCount: { type: Number, default: 0 },
      },
    ],

    osType: [
      {
        osName: { type: String, required: true },
        uniqueClicks: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 },
      },
    ],

    deviceType: [
      {
        deviceName: { type: String, required: true },
        uniqueClicks: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model("Analytics", analyticsSchema);
module.exports = userModel;

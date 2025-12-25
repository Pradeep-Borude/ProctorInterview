// models/session.model.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["waiting", "live", "ended"],
    default: "waiting"
  },

  // PROCTOR DATA
  focusLostCount: { type: Number, default: 0 },
  fullscreenExitCount: { type: Number, default: 0 },
  inactiveMouseCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },
  riskStatus: {
    type: String,
    enum: ["NORMAL", "SUSPICIOUS", "HIGH_RISK"],
    default: "NORMAL"
  },

  endedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Session", sessionSchema);

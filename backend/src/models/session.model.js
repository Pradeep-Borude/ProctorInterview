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
  status: {
    type: String,
    enum: ["waiting", "live", "ended"],
    default: "waiting"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Session", sessionSchema);

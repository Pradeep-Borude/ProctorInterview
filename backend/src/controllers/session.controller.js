const sessionModel = require("../models/session.model");
const { v4: uuidv4 } = require("uuid");

// POST /api/session/create
async function createSession(req, res) {
  try {
    //  userId JWT middleware se aayega
    const userId = req.user.id;

    const roomId = "CPSB-" + uuidv4().slice(0, 8);

    const session = await sessionModel.create({
      roomId,
      hostId: userId,
      status: "waiting"
    });

    res.status(201).json({
      message: "Session created successfully",
      roomId,
      sessionId: session._id
    });

  } catch (err) {
    res.status(500).json({ message: "Session creation failed" });
  }
}

module.exports = { createSession };

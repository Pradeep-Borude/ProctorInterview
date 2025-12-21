const sessionModel = require("../models/session.model");
const { v4: uuidv4 } = require("uuid");

// POST /api/session/create
async function createSession(req, res) {
  try {
    //  userId JWT middleware se aayega
    const userId = req.user.id;

    
  //  already active?
  const existingSession = await sessionModel.findOne({
    hostId: userId,
    status: { $in: ["waiting", "live"] }
  });

 if (existingSession) {
    return res.status(400).json({
      message: "You already have an active session",
      roomId: existingSession.roomId
    });
  }

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

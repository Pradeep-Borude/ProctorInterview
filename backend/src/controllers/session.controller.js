const sessionModel = require("../models/session.model");
const { v4: uuidv4 } = require("uuid");

// CREATE SESSION
async function createSession(req, res) {
  try {
    const userId = req.user.id;

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
      hostId: userId
    });

    res.status(201).json({
      message: "Session created successfully",
      roomId,
      sessionId: session._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Session creation failed" });
  }
}

// VERIFY ROOM
async function verifyRoom(req, res) {
  try {
    const { roomId } = req.body;
    const userId = req.user.id;

    const session = await sessionModel.findOne({
      roomId,
      status: { $in: ["waiting", "live"] }
    });

    if (!session) {
      return res.status(404).json({ message: "Room not found" });
    }

    let role;

    if (session.hostId.toString() === userId) {
      role = "interviewer";
    } else {
      if (!session.candidateId) {
        session.candidateId = userId;
        session.status = "live";
        await session.save();
        role = "interviewee";
      } else if (session.candidateId.toString() === userId) {
        role = "interviewee";
      } else {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    res.json({ roomId: session.roomId, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
}

// END SESSION  (get and store data in db)
async function endSession(req, res) {
  try {
    const {
      roomId,
      focusLostCount,
      fullscreenExitCount,
      inactiveMouseCount,
      riskScore,
      status
    } = req.body;

    const session = await sessionModel.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.focusLostCount = focusLostCount;
    session.fullscreenExitCount = fullscreenExitCount;
    session.inactiveMouseCount = inactiveMouseCount;
    session.riskScore = riskScore;
    session.riskStatus = status;
    session.status = "ended";
    session.endedAt = new Date();

    await session.save();

    res.json({
      message: "Session ended successfully",
      session
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to end session" });
  }
}

module.exports = {
  createSession,
  verifyRoom,
  endSession 
};

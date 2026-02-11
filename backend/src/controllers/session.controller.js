const sessionModel = require("../models/session.model");

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

    const {roomId ,date , from , to} = req.body;

    const session = await sessionModel.create({
      roomId,
      date,
      from,
      to,
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
      screenResizeCount,
      inactiveMouseCount,
      riskScore,
      status
    } = req.body;

    const session = await sessionModel.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.focusLostCount = focusLostCount;
    session.screenResizeCount = screenResizeCount;
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


async function getMySessions(req, res) {
  try {
    const sessions = await sessionModel.find({
      hostId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
    });
  }
};

module.exports = {
  createSession,
  verifyRoom,
  endSession,
  getMySessions 
};

const express = require("express");
const sessionController = require("../controllers/session.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();


// session
router.post(
    "/create",
    protect,
    sessionController.createSession
);

// session end
router.post(
  "/end",
  protect,
  sessionController.endSession
);


// verify room
router.post(
    "/verify-room",
     protect,
    sessionController.verifyRoom
);

router.get(
  '/my-sessions',
  protect,
  sessionController.getMySessions
);

module.exports = router;

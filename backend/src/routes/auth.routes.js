const express = require("express");
const authController = require("../controllers/auth.controller");
const sessionController = require("../controllers/session.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// auth
router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);
router.get("/user/logout", authController.logoutUser);
// verify user
router.get("/user/getUserData/",
    protect,
    authController.verifyUser
);

// session
router.post(
    "/session/create",
    protect,
    sessionController.createSession
);

module.exports = router;

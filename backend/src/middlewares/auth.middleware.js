// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.userToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.id };

  next();
};

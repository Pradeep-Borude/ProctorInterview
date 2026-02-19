const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = async function (req, res, next) { 
  const token = req.cookies.userToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('role').lean();
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { 
      id: decoded.id,
      role: user.role  
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

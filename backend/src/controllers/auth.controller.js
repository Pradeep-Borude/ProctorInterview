const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

async function registerUser(req, res) {
  const { fullName, email, role, password } = req.body;

  const isUseraAlreadyExists = await userModel.findOne({ email });

  if (isUseraAlreadyExists) {
    return res.status(400).json({
      message: "user already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    fullName,
    email,
    role,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("userToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    message: "user registered successfully",
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("userToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    message: "user logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  });
}

function logoutUser(req, res) {
  res.clearCookie("userToken");
  res.status(200).json({
    message: " user logged out successfully",
  });
}

async function verifyUser(req, res) {
  try {

    const token = req.cookies.userToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "UserId not found ",
        userId
      });
    }
    res.status(200).json({
      message: "User verified successfully", user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,

      }
    });

  } catch (err) { }


}



module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser
};

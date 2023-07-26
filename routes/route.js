const express = require("express");
const Router = express.Router();
const User = require("../model/model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { authenticateToken } = require("../middalware/index");
dotenv.config();

const secretKey = process.env.SECRET_KEY;

Router.post("/register", async (req, res) => {
  const { userName, userPassword, userEmail } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (userPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be 6 letter long" });
    }

    // Hash the userPassword

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create a new user object (you can save it to a database here)
    const user = new User({
      userName,
      userPassword: hashedPassword,
      userEmail,
    });

    // Save the user to the database
    await user.save();

    const expirationTime = Math.floor(Date.now() / 1000) + 604800; // 7 days from now
    const payload = {
      user,
      exp: expirationTime,
    };
    // Generate a JWT token
    const token = jwt.sign(payload, secretKey);

    // Return the token to the client
    res.json({ user, token });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// Login user
Router.post("/login", async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.userPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid userPassword" });
    }
    const expirationTime = Math.floor(Date.now() / 1000) + 604800; // 7 days from now
    const payload = {
      user,
      exp: expirationTime,
    };
    const token = jwt.sign(payload, secretKey);

    res.json({ user, token });
  } catch (error) {
    console.error("Failed to login user:", error);
    res.status(500).json({ message: "Failed to login user" });
  }
});

Router.get("/user", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = Router;

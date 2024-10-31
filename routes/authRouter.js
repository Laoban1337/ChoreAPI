const express = require("express");
const authRouter = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");
const SECRET = process.env.SECRET;

// Signup Route
authRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: "Username already exists" });
    }

    // Create a new user with plaintext password
    const newUser = new User({ username, password });
    await newUser.save();

    //Creates member associated with the logged in user
    const newMember = new Member({
      memberName: username,
      user: newUser._id, //associates the user with the Member
    });

    await newMember.save();
    //Generate a token for the new user

    //

    // console.log("Signup route reached");
    // console.log("Plaintext password before hashing:", password); // Debugging line
    // console.log("Hashed password:", newUser.password); // Debugging line

    // Generate a token for the new user
    const token = jwt.sign({ userId: newUser._id }, SECRET, {
      expiresIn: "35d", //35d for testing will change back to 1h after test are completed
    });

    // Send the response with the token and the user data
    return res.status(201).send({ token, user: newUser.withoutPassword() });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});
//

// Login Route
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found"); // Debugging line
      return res.status(401).send({ message: "Invalid username or password" });
    }

    console.log("User found:", user); // Debugging line

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      console.log("Password does not match"); // Debugging line
      return res.status(401).send({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });
    return res.status(200).send({ token, user: user.withoutPassword() });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

module.exports = authRouter;

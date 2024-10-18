const express = require("express");
const userRouter = express.Router();
const User = require("../models/User");

userRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    return next(error);
  }
});

module.exports = userRouter;

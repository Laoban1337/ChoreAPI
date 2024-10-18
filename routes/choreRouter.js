const express = require("express");
const choreRouter = express.Router();
const Chore = require("../models/Chore")

choreRouter.use(express.json());
//get list of chores
choreRouter.get("/", async (req, res, next) => {
  try {
    const chores = await Chore.find();
    res.status(200).send(chores);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

choreRouter.post("/", async (req, res, next) => {
  try {
    req.body.user = req.auth._id;
    req.body.username = req.auth.username;
    const newChore = new Chore(req.body);

    const savedChore = await newChore.save();
    res.status(200).send(savedChore);
  } catch (error) {
    next(error);
  }
});

// get chore from householdmember?

module.exports = choreRouter;

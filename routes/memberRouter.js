const express = require("express");
const memberRouter = express.Router();
const Member = require("../models/Member");
const Household = require("../models/Household");
const user = require("../models/User");

// Invite a user household
memberRouter.post("/household/:householdId/invites", async (req, res, next) => {
  const { invitedUserId, householdId } = req.body;

  try {
    if (!household || !invitedUser) {
      return res.status(404).send({ message: "Household or User not found" });
    }

    //check if user is already a member of the household
    const existingMember = await Member.find({
      user: invitedUserId,
      household: householdId,
    });
    if (existingMember) {
      return res
        .status(400)
        .send({ message: "User is already a member of this Household" });
    }

    //create a new Member record for the invited user
    const newMember = new Member({
      memberName: invitedUserId.username,
      household: householdId,
      user: invitedUserId,
    });

    await newMember.save();

    //send success response
    return res.status(201).send({ message: "Invite sent", member: newMember });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

//accept-invite
memberRouter.post(
  "/household/:householdId/members/:memberId/accept",
  async (req, res, next) => {
    const { memberId } = req.body;

    try {
      if (!memberId) {
        return res.status(404).send({ message: "Member not found" });
      }

      member.status = "active";

      await member.save();
    } catch (error) {
      console.error({ message: error.message });
      res.status(500).send({ message: error.message });
    }
  }
);

module.exports = memberRouter;

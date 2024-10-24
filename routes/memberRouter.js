const express = require("express");
const memberRouter = express.Router();
const Member = require("../models/Member");
const Household = require("../models/Household");
const user = require("../models/User");
const authenticate = require("../middleware/authenticate");

// Invite a user household
memberRouter.post("/household/:householdId/invites", async (req, res, next) => {
  const { invitedUserId } = req.body;
  const { householdId } = req.params;

  try {
    const household = await Household.findById(householdId);
    const invitedUser = await user.findById(invitedUserId);

    if (!household || !invitedUser) {
      return res.status(404).send({ message: "Household or User not found" });
    }

    //check if user is already a member of the household
    const existingMember = await Member.findOne({
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
      const member = await Member.findById(memberId);
      if (!memberId) {
        return res.status(404).send({ message: "Member not found" });
      }

      member.status = "active";

      await member.save();
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).send({ message: error.message });
    }
  }
);
//reject invite
memberRouter.delete(
  "/household/:householdId/members/:memberId/reject",
  authenticate,
  async (req, res, next) => {
    const { householdId,memberId } = req.params;
    try {
        const rejectedInvite = await Member.findOne({_id:memberId,household:householdId})
        if(!rejectedInvite){
            return res.status(404).send("invite not found")
        }
        rejectedInvite.status = "rejected"
        
        await rejectedInvite.save()
        
    } catch (error) {
        console.error("Error rejecting this request")
        res.status(500).send({message:error.message})
    }
  }
);

//get pending invites 
memberRouter.get("household/:householdId/member/:memberId/pending",authenticate,async(req,res,next)=>{
    const {householdId} =req.params
    try {
        pendingInvites = await Member.find({household:householdId,status:"pending"})
         if (pendingInvites.length ===0) {
            return res.status(404).send("No pending invites found")
         }
        
    } catch (error) {
        
    }
})
module.exports = memberRouter;

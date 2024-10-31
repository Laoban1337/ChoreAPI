const express = require("express");
const memberRouter = express.Router();
const Member = require("../models/Member");
const Household = require("../models/Household");
const User = require("../models/User");
const {
  createinviteToken,
  verifyInviteToken,
} = require("../middleware/tokenUtils");
const authenticate = require("../middleware/authenticate");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Invite user to a household
memberRouter.post("/household/:householdId/invites", async (req, res) => {
  console.log("Invite route hit!");

  const { invitedUserId } = req.body;
  const { householdId } = req.params;

  console.log("Checking username", invitedUserId); //debugging line

  try {
    //sends error message if inviteduserId not added in the body of the request
    if (!invitedUserId) {
      return res.status(400).send({ message: "InvitedUserId is required" });
    }

    const household = await Household.findById(householdId);
    const invitedUser = await User.findById(invitedUserId);

    //creat the token with houshold, member and email details
    const tokenPayLoad = {
      householdId,
      memberId: invitedUser._id,
      email: invitedUser.email,
    };
    const token = createinviteToken(tokenPayLoad);

    if (!household || !invitedUser) {
      return res.status(404).send({ message: "Household or User not found" });
    }

    //check if user is already a member of the household
    const existingMember = await Member.findOne({
      user: invitedUserId, //user ObjectId for the check
      household: householdId,
    });
    if (existingMember) {
      return res.status(400).send({
        message: `User: ${invitedUser.username} has already been invited/already a member of: ${household.houseName}`,
      });
    }

    const membersName = invitedUser.username;
    console.log("membersName:", membersName);

    //create a new Member record for the invited user
    const newMember = new Member({
      memberName: membersName, //gets username for invited user object
      household: householdId,
      user: invitedUserId, //reference to the user's objectId
    });

    //add invites user to the pending invites of the inviting household
    household.pendingInvites.push({
      userId: invitedUserId,
      username: invitedUser.username,
    });
    //save the updated household document
    household.save;
    await newMember.save();

    //send success response
    return res.status(201).send({ message: "Invite sent", member: newMember });
  } catch (error) {
    console.error("Error inviting user:", error);
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
});
//invite user via email using nodemailer
memberRouter.post(
  "/household/:householdId/invite",
  authenticate,
  async (req, res) => {
    const { email } = req.body;
    const { householdId } = req.params;

    try {
      //check if household exists
      const household = await Household.findById(householdId);
      //find household
      if (!household) {
        return res.status(404).send({ message: "Household not found" });
      }

      //generate token
      const tokenPayLoad = { householdId, email };
      const token = createinviteToken(tokenPayLoad);

      //creat invite link
      const inviteLink = `${process.env.BASE_URL}/accept-invite?householdId=${householdId}&email=${email}`;

      //semd email invite
      const mailOptions = {
        from: process.env.Email_user,
        to: email,
        subject: `Invite to join ${household.houseName}`,
        text: `You've been invite "${household.houseName}" Click to accept the invite:\n\n ${inviteLink}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error)
          return res
            .status(500)
            .send({ message: "Failed to send email", error });
        res.status(200).send({ message: "invte sent successfully" });
      });
    } catch (error) {
      console.error("Error inviting user".error);
      res.status(500).send({ message: "internal server error", error });
    }
  }
);

//accept-invite route

memberRouter.post("/household/accept-invte", async (req, res) => {
  const token = req.query;

  try {
    //verify token
    const decoded = verifyInviteToken(token);
    const { householdId, email } = decoded;

    //find household and invited member
    const household = await Household.findById(householdId);
    const invitedUser = await User.findOne({ email });

    if (!household || !invitedUser)
      return res.status(404).send({ message: "invalid invite" });

    //update member status to `active` and add them to household
    const member = await Member.findOneAndUpdate(
      { user: invitedUser._id, household: householdId },
      { status: "active" },
      { new: true }
    );
    if(!member) return res.status(404).send({message:"invite not found"})
         household.houseMembers.push(member._id)
        household.pendingInvites= household.pendingInvites.filter(invite =>invite.userId.toString() !==invitedUser._id.toString())
        
        await household.save()
        res.status(200).send({message:`${invitedUSer.username} joined ${household.houseName}`})
  } catch (error) {
    console.error("error acceoting invte:",error)
    res.status(500).send({message:"Failed to accept invite"})
  }
});

// memberRouter.post(
//   "/household/:householdId/members/:memberId/accept",
//   async (req, res) => {
//     const { householdId, memberId } = req.params;
//     console.log("householdID", householdId);
//     console.log("memberId", memberId);

//     try {
//       const member = await Member.findById(memberId).populate(
//         `user`,
//         `username`
//       );
//       if (!member) {
//         return res.status(404).send({ message: "Member not found" });
//       }
//       //update the member's status to active
//       member.status = "active";
//       await member.save(); //saving updated member

//       //remove the member from the pendinginvites
//       await Household.findByIdAndUpdate(householdId, {
//         $pull: { pendingInvites: memberId, _id: { $ne: householdId } },
//         $addToSet: { houseMembers: memberId }, //ensures no duplicates
//       });
//       //   invitingHousehold.pendingInvites = invitingHousehold.pendingInvites.filter((invite=>invite.userId.toString() !==member.user.toString()))

//       //update the household
//       const invitingHousehold = await Household.findById(householdId);
//       if (!invitingHousehold) {
//         return res.status(404).send({ message: "Household not found" });
//       }

//       //remove this memberID from pendinvites in any other households
//       await Household.updateMany(
//         { pendingInvites: memberId, _id: { $ne: householdId } },
//         { $pull: { pendingInvites: memberId } }
//       );

//       //add the member to the household
//       invitingHousehold.houseMembers.push(member.user);

//       await invitingHousehold.save(); // saves updated household

//       return res
//         .status(200)
//         .send(
//           `${member.username} accepted invite from ${invitingHousehold.houseName}`
//         );
//     } catch (error) {
//       console.error("Error accepting invite:", error);
//       res.status(500).send({ message: error.message });
//     }
//   }
// );

//accept invte from email
memberRouter.post("/household/:hoouseId/invite");

//reject invite
memberRouter.delete(
  "/household/:householdId/members/:memberId/reject",
  authenticate,
  async (req, res, next) => {
    const { householdId, memberId } = req.params;
    try {
      const rejectedInvite = await Member.findOne({
        _id: memberId,
        household: householdId,
      });
      if (!rejectedInvite) {
        return res.status(404).send("invite not found");
      }
      rejectedInvite.status = "rejected";

      await rejectedInvite.save();
    } catch (error) {
      console.error("Error rejecting this request");
      res.status(500).send({ message: error.message });
    }
  }
);

//get pending invites
memberRouter.get(
  "household/:householdId/member/:memberId/pending",
  authenticate,
  async (req, res, next) => {
    const { householdId } = req.params;
    try {
      pendingInvites = await Member.find({
        household: householdId,
        status: "pending",
      });
      if (pendingInvites.length === 0) {
        return res.status(404).send("No pending invites found");
      }
    } catch (error) {}
  }
);
module.exports = memberRouter;

const express = require("express");
const householdRouter = express.Router();
const Household = require("../models/Household");
const Member = require("../models/Member");
const authenticate = require("../middleware/authenticate");

//create household
householdRouter.post("/addhousehold", authenticate, async (req, res, next) => {
  const { houseName } = req.body;
  try {
    const newHousehold = new Household({
      houseName: houseName,
      createdBy: req.user.userId,
      houseMembers:[{userId:req.user.userId,role:"head"}]
    });
    console.log("New household created:", newHousehold);
    console.log("Logging req.user", req.user);
    //first to create a household is the head of household. Assign chores, delete member, edit chores, etc
    
      // newHousehold.houseMembers.push({
      //   userId: req.user.userId,
      //   role: "head",
      // });
    
      //everyone else is just a member after "head" has been assigned
      // newHousehold.houseMembers.push({
      //   userId: req.user.userId,
      //   role: "member",
      // });
   
    //save househol after updating members
    try {
      const exsistingHousehold = await Household.findOne({
        houseName:houseName
        
      })
      if(exsistingHousehold){
        return res.status(403).send("Household name is already taken")
      }
      await newHousehold.save();
      console.log("household saved:", newHousehold)
   
    } catch (error) {
      console.error("error durring save operation",error);
    }

    return res.status(201).send(newHousehold);
  } catch (error) {
    res
      .status(500)
      .send({ message: "There was an error processing your request" });

    console.error("there was an internal server error");
  }
});
//get all households
householdRouter.get("/householdList", authenticate, async (req, res, next) => {
  try {
    const householdList = await Household.find();
    res.status(200).send(householdList);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .send({ houseListError: "error retrieving house list" });
  }
});

//get a household by ID
householdRouter.get(
  "/householdList/:householdId",
  authenticate,
  async (req, res, next) => {
    const { householdId } = req.params.householdId;
    try {
      const foundHouse = Household.findById(householdId);
      res.status(200).send(foundHouse);
    } catch (error) {
      console.error("there were no houses found!");
      return res.status(404).send("There were no houses found with that Id");
    }
  }
);

//get all household members
householdRouter.get("/houseMembers", authenticate, async (req, res, next) => {
  try {
    const houseMembers = await Household.find();
    res.status(200).send(houseMembers);
  } catch (error) {
    res.status(500);
    return next(error.message);
  }
});

//add route to get a member from house by id
householdRouter.get(
  "/houseMembers/:memberId",
  authenticate,
  async (req, res, next) => {
    try {
      const memberId = req.params.memberId;
      const member = await Household.findById(memberId);
      res.status(200).send(member);
    } catch (error) {
      res.status(500);
      return next(error);
    }
  }
);

// add route to delete one memeber from household
householdRouter.delete("/houseMembers/:memberId", authenticate, async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const userId = req.user.userId;

    //find the current user making the delete request
    const currentUser = await Member.findOne({
      user: userId,
      household: req.body.household,
    });

    //checking if current user is head of the household
    if (!currentUser || currentUser.role !== "head") {
      return res
        .status(403)
        .send("Only the head of household can remove members!");
    }

    //Find and delete member by ID
    const deletedMember = await Member.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).send(`Member with the id ${memberId} not found`);
    }

    //logging deleted members Id and role
    console.log(
      `The member with the id ${memberId} and the role ${deletedMember.role}`
    );

    //update household after delete
    await Household.updateOne(
      { _id: deletedMember.household },
      { $pull: { members: memberId } }
    );

    console.log(`The member with the id ${memberId} has been deleted`);
    res.status(200).send(`Member with the id ${memberId} has been removed`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error!");
  }
});

// route for a user to leave a household
householdRouter.post("/leave-household"),
  authenticate,
  async (req, res, next) => {
    try {
      const { userId, householdId } = req.body;
      //find the household
      const household = await Household.findById(householdId);

      if (!household) {
        return res.status(404).send("Household not found, please try again");
      }

      //find the member to be removed
      const memberIndex = household.houseMembers.findIndex(
        (m) => m.userId.toString() === userId
      );

      const memberRole = household.houseMembers[memberIndex].role;

      if (memberRole === "head") {
        return res.status(400).send({
          message:
            "cannot leave the household without assigning a new head of household",
        });
      }

      //assign new head of house before leaving (if there are more member in the household)
      if (household.houseMembers.length > 1) {
        const newHead = household.houseMembers.find(
          (m, index) => index !== memberIndex
        );
        newHead.role = "head";
      } else {
        //delete household if empty
        await household.remove();
        return res.status(200).send({
          message: "Household deleted because the last member has left",
        });
      }
      //member leaves household
      household.houseMembers.splice(memberIndex, 1);

      //update household after memeber leaves
      await household.save();
      return res
        .status(200)
        .send({ message: `User with the id ${userId} left the household` });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "server error" });
      next(error);
    }
  };

module.exports = householdRouter;

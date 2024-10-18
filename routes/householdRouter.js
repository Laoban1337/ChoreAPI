const express = require("express");
const householdRouter = express.Router();
const Household = require("../models/Household");
const Member = require("../models/Member");
const authenticate = require("../middleware/authenticate");


//create household
householdRouter.post('/household',authenticate, async(req,res,next)=>{
  const {householdName}= req.body
  try {
    const newHousehold = new Household({
      name:householdName,
      createdBy:req.user.userId
    })
    await newHousehold.save();
    res.status(201).send(newHousehold)
    
  } catch (error) {
    res.status(500).send({message:'There was an error processing your request'})
    next(error)
    console.log('there was an internal ser')
  }
})

//get all household members
householdRouter.get("/", async (req, res, next) => {
  try {
    const houseMembers = await Household.find();
    res.status(200).send(houseMembers);

  } catch (error) {
    res.status(500);
    return next(error.message);
  }
});

//add route to get a member from house by id
householdRouter.get("/:memberId", async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const member = Household.findById(memberId);
    res.status(200).send(member);
  } catch (error) {
    res.status(500);
    return next(error);
  }
});

// add route to delete one memeber from household
householdRouter.delete("/:memberId", async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const deletedMember = await Member.findByIdAndDelete(memberId);
    if (deletedMember) {
      console.log(
        `The member with the ${memberId} has been deleted from the househould`
      );
    }

    //update household after delete
    await Household.updateOne(
      { _id: deletedMember.Household },
      { $pull: { members: memberId } }
    );
    console.log(`The member with the id ${memberId} has been deleted`)
    res.status(200).send(``);
  } catch (error) {}
});

// add route to update hhM

//add route that sends hhr to hhm(hhr= householdrequest - house hold member)

module.exports = householdRouter;

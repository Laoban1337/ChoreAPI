const express = require("express");
const choreRouter = express.Router();
const Chore = require("../models/Chore")
const Member = require('../models/Member')
choreRouter.use(express.json());

//middleware checking if user is head of household
const isHeadOfHousehold = async(req,res,next)=>{
   const userId = req.auth._id
  try{
    const member = await Member.findOne({user:userId,household:req.body.householdId})
    if(!member||member.role !=="head"){
      return res.status(403).send("You are not Authorized to assign chores")
    }
     next()
  }catch(error){
    res.status(500)
    next(erro)

  }
}


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
//post a chore
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


//assign a chore to a household memeber (Only "head" can assign chores)
choreRouter.post("/",isHeadOfHousehold, async (req,res,next)=>{
  try {
     const {householdId,memberId,description,duedate} = req.body
     const newChore =  new Chore({
      household:householdId,
      assignedTo:memberId,
      description,
      duedate,
      assignBy:req.auth_id, //track who assigned the chose
      status:"pending"
     })

     const savedAssignedChore = newChore.save()
     res.status(201).send(savedAssignedChore)
  } catch (error) {
    next(error)
  }
})

// get all chores for specific household members
choreRouter.get("/member/:memberId",async (req,res,next)=>{
  
  const memberChore = await Chore.find({assignedTo:memberId})

  if(chore.length ===0){
    return res.status(404).send("User has no chores assigned")
  }
  res.status(200).send(memberChore)
})

module.exports = choreRouter;

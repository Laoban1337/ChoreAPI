const mongoose = require("mongoose")
const Schema = mongoose.Schema

const memberSchema = new Schema({
    memberName:{
        type:String,
        required:true
    },
    household:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Household",
        // required:true
       
    },
    user:{// Reference to the User model (logged-in user)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status:{
        type:String,
        enum:["invited","active","pending","rejected"],
        default:"pending"
    },
    role:{
        type:String,
        enum:["head","member"],
        default:"member"
    }
})

const Member = mongoose.model("Member",memberSchema)

module.exports = Member
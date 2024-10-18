const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const choreSchema = new Schema({
  chorename: {
    type: String,
    required: true,
  },
  choreTime: {
    type: Number,
    required: true,
  },
  choreImage: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // ?required: true,
  },
  username: {
    type: String,
  },
  assignedTo:{
    type:String,
  },
   createdOn:{
    type:Date,
    default:Date.now
   },
   completed:{type:Boolean},

   likedUser:[{type:Schema.Types.ObjectId, ref:"User"}],
   disLikedUser:[{type:Schema.Types.ObjectId, ref:"User"}],
});

module.exports = mongoose.model("Chore",choreSchema)

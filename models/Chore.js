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
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  description: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  likedUser: [{ type: Schema.Types.ObjectId, ref: "User" }],
  disLikedUser: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Chore", choreSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Function to limit the number of household members to 5
const arrayLimit = (val) => val.length <= 5;

const householdSchema = new Schema({
  houseName: {
    type: String,
    required: true,
    lowercase: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  houseMembers: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["head", "member"], required: true },
      },
    ],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"], // Move validate here
  },
  pendingInvites: [
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String },
    },
],
  houseMembersChores: [{ type: Schema.Types.ObjectId, ref: "Chore" }],
});

module.exports = mongoose.model("Household", householdSchema);

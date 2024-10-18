const mongoose = require("mongoose");
// const { schema, validate } = require("./User");
const Schema = mongoose.Schema;

const householdSchema = new Schema({
  houseName: {
    type: String,
    required: true,
    lowercase: true,
  },
  houseMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
    },
  ],
  houseMembersChores: [{ type: Schema.Types.ObjectId, ref: "Chore" }],
  
});

//limits the number of household member to 5
function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("Household", householdSchema);

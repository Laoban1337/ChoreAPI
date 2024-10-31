const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

//function to create a token with the give payload and expiration
const createInviteToken = (payload, expiresIn = `1d`) => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

//verify the token in the invite link
const verifyInviteToken = (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send({ message: "Token is required" });
  }

  try {
    //decode and verify the token
    const decoded = jwt.verify(token, SECRET);
    req.inviteData = decoded
  } catch (error) {
    console.error("invalid or expired invite link");
  }
};

module.exports = { createInviteToken, verifyInviteToken };

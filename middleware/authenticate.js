const jwt = require("jsonwebtoken");

//Middleware top authenticate the user using JWT

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }
  try {
    //verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = { userId: decoded.userId }; //attaches user info to request object
    // continue middleware or route handler
    next(); 
    //catch errors
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authenticate;

// apply to protected routes

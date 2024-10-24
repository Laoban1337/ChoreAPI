const express = require("express");
const mongoose = require(`mongoose`);
const morgan = require("morgan");
require("dotenv").config();
const { expressjwt } = require("express-jwt");
const authenticate = require("./middleware/authenticate");
const app = express();
const port = process.env.PORT || 7705;
const databaseConnection = process.env.DB;
const SECRET = process.env.SECRET;

//middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(authenticate)

//database connect
mongoose
  .connect(databaseConnection, {
    message: console.log("Attempting to connect to the Database"),
  })
  .then(() => {
    console.log("Now connnected to the Database: Mongo-DB");
  })
  .catch((err) => {
    console.error(`Failed to connect to the database`, err);
  });

//connection event log
const db = mongoose.connection;
db.on(`error`, (err) => {
  console.error(
    `failed to connect to the database: ${err} Connection status = False`
  );
});
db.once(`open`, () => {
  console.log("Connection check completed: Connection status = True");
});

//routes

//signup and login route
app.use("/api/auth", require("./routes/authRouter"));

//protected routes
app.use(
  "/api/main",
  expressjwt({ secret: SECRET, algorithms: ["HS256"] })
  // (req, res, ) => {
  //   res.send(
  //     "This is a protected route, you dont have access to this. Please log in."
  //   );
);

app.use("/api/main/user", require("./routes/userRouter"));
app.use(`/api/main/chore`, require("./routes/choreRouter"));
app.use("/api/main/household", require("./routes/householdRouter"));
app.use("/api/main/member", require("./routes/memberRouter"));
//error handling
app.use((err, req, res, next) => {
  console.error(err.stack, "Error stack");
  return res.status(500).send({ errMsg: err.message });
});

//server listener
app.listen(port, () => {
  console.log(`server started listening on ${port}`);
});

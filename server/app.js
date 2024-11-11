const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const userRouter = require("./routes/userRouter");
const organizationRouter = require("./routes/organizationRouter");
const verifierRouter = require("./routes/verifierRouter");
const authController = require("./controllers/authController");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "production"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json());
// app.use(express.static(`${__dirname}/dist`));

app.get("/api/entity", authController.checkAuth, authController.getCurrentUser);
app.use("/api/users", userRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/verifiers", verifierRouter);

// app.all("*", (req, res, next) => {
//   res.sendFile(`${__dirname}/dist/index.html`);
// });

// GLOBAL ERROR HANDLER MIDDLEWARE:
app.use(globalErrorHandler);
module.exports = app;

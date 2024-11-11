const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  console.error("Triggered casterror");
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  console.error("Triggered duplicate fields error");
  // Usually occrus for email or username:
  let message;
  if (err.keyValue?.email) message = "User with the provided email already exists. Please Log In!";
  else if (err.keyValue?.username) message = "Username already taken";
  else
    message = `Duplicate value for field ${Object.keys(err.keyValue).at(0)}. Please use another value`;
  return new AppError(400, message);
};

const handleValidationErrorDB = (err) => {
  //   const messages = [];
  //   for (const [name, obj] of Object.entries(err.errors)) {
  //     console.log(name);
  //     messages.push(`${name}: ${obj.message}`);
  //   }
  //   const errors = Object.entries(err.errors).map((el) => `${el[0]}: ${el[1]}`);
  // Here, every element el is an array of [key, value] pair within err.errors

  const fields = Object.keys(err.errors);
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input in fields: ${fields.join(", ")}. ${errors.join(". ")}`;
  return new AppError(400, message);
};

const handleJWTInvalidError = (err) => {
  console.error(`Triggered JWT Error: ${err.message}`);
  return new AppError(401, "Invalid Token. Please log-in again");
};

const handleJWTExpiredError = (err) => {
  console.error(`Triggered JWT Error: ${err.message}`);
  return new AppError(401, "Token expired. Please log-in again");
};

const globalErrorHandler = (err, req, res, next) => {
  if (err.name === "CastError") err = handleCastErrorDB(err);
  else if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") err = handleValidationErrorDB(err);
  else if (err.name === "JsonWebTokenError") err = handleJWTInvalidError(err);
  else if (err.name === "TokenExpiredError") err = handleJWTExpiredError(err);
  // Setting Default Values:
  err.statusCode ||= 500;
  err.status ||= "error";
  console.log("--------⚠️️ ERROR CONTROLLER ⚠️--------");
  console.log(err);
  res.status(err.statusCode).json({ status: err.status, message: err.message, error: err });
};

module.exports = globalErrorHandler;

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Verifier = require("../models/Verifier");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/sendMail");

const userTypeToModel = {
  User,
  Organization,
  Verifier,
};
// NOTE: All time values in NODE_ENV are in seconds, they are converted to ms if required
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: +process.env.JWT_EXPIRES_IN, // JWT_EXPIRES_IN = 6000, meaning 100 minutes
    // Passing a string value "60" means 60 milliseconds, int 60 implies 60 seconds, thus the conversion.
  });
  return token;
};

const respondWithCookie = (res, statusCode, cookie, data) => {
  res.cookie(cookie.name, cookie.value, {
    maxAge: +process.env.JWT_EXPIRES_IN * 1000, // in ms
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(statusCode).json({ ...data });
};

// Chech Auth middleware for protected routes:
// userType = "User" | "Organization" | "Verifier"
// exports.checkAuth = (userType) => {
//   return catchAsync(async (req, res, next) => {
//     console.log("Cookies: ", req.cookies);

//     // (1) Extract the token from the cookies and check if it exists:
//     const cookieName = `jwt_${userType.toLowerCase()}`;
//     const token = req.cookies?.[cookieName];
//     if (!token) throw new AppError(401, `${userType} is not logged in`);

//     // (2) Decode the JWT Token, possible errors are invalid token and expired token:
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Original Payload
//     console.log("Decoded JWT: ", decoded);

//     // let Model;
//     // if (userType === "User") Model = User;
//     // else if (userType === "Organization") Model = Organization;
//     // else if (userType === "Verifier") Model = Verifier;
//     const Model = userTypeToModel[userType];
//     // (3) Find user/organization/verifier based on id inside the decoded token (payload).
//     const document = await Model.findById(decoded.id);
//     if (!document) throw new AppError(`${userType} associated with the id no longer exists`);

//     // (4) Check if password was changed after token generation:
//     if (decoded.iat * 1000 < document.lastPasswordChanged)
//       throw new AppError(401, "Password changed after JWT was issued");

//     req[userType.toLowerCase()] = document; // req.user | req.organization | req.verifier
//     next();
//   });
// };

exports.checkAuth = catchAsync(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);

  // let token;
  // let userType;
  // for (const [_userType] of Object.keys(userTypeToModel)) {
  //   const cookieName = `jwt_${userType.toLowerCase()}`;
  //   userType = _userType;
  //   token = req.cookies?.[cookieName];
  //   if (token) break;
  // }

  const userType = Object.keys(userTypeToModel).find(
    // (val) => req.cookies?.[`jwt_${val.toLowerCase()}`] !== undefined
    (val) => req.cookies?.[`jwt_${val.toLowerCase()}`]
  );

  console.log("Logged in Type found: ", userType);

  if (!userType) throw new AppError(401, "No entity is not logged in"); // Either this or the one below
  // (1) Extract the token from the cookies and check if it exists:
  const token = req.cookies?.[`jwt_${userType.toLowerCase()}`];

  // if (!token) throw new AppError(401, `${userType} is not logged in`);

  // (2) Decode the JWT Token, possible errors are invalid token and expired token:
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Original Payload
  console.log("Decoded JWT: ", decoded);

  // let Model;
  // if (userType === "User") Model = User;
  // else if (userType === "Organization") Model = Organization;
  // else if (userType === "Verifier") Model = Verifier;
  const Model = userTypeToModel[userType];
  // (3) Find user/organization/verifier based on id inside the decoded token (payload).
  const document = await Model.findById(decoded.id);
  if (!document) throw new AppError(`${userType} associated with the id no longer exists`);

  // (4) Check if password was changed after token generation:
  if (decoded.iat * 1000 < document.lastPasswordChanged)
    throw new AppError(401, "Password changed after JWT was issued");

  req[userType.toLowerCase()] = document; // req.user | req.organization | req.verifier
  next();
});

// ROUTE: /users/login /organizations/login /verifiers/login [POST]
exports.signup = (userType) => {
  return catchAsync(async (req, res, next) => {
    // const { email, username, name, password, phoneNumber } = req.body; // For User
    // const { email, name, phoneNumber, address, password } = req.body; // For Organization

    const Model = userTypeToModel[userType];
    const createdDoc = await Model.create({ ...req.body });
    res.status(201).json({
      status: "success",
      message: "User created successfully! Please login",
      [userType.toLowerCase()]: createdDoc, // user: createdDoc or organization: createdDoc
    });
  });
};

// ROUTE: /users/login [POST]
exports.userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  if (!user) throw new AppError(404, "No user found with this email");

  const isPasswordMatch = await user.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError(401, "Incorrect Password!");

  const token = signToken(user._id);
  console.log("JWT token for User before sending as cookie:", token);
  // res.status(200).cookie("jwt_user", token).json({
  //   status: "success",
  //   message: "Logged In Successfully",
  // });
  const cookie = { name: "jwt_user", value: token };
  const data = { status: "success", message: "Logged In Successfully", user };
  respondWithCookie(res, 200, cookie, data);
});

// ROUTE: /organization/login [POST]:
exports.organizationLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const organization = await Organization.findOne({ email }).select("+password");
  console.log(organization);

  if (!organization) throw new AppError(404, "No organization found with this email");

  const isPasswordMatch = await organization.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError(401, "Incorrect Password!");

  const token = signToken(organization._id);
  console.log("JWT token for User before sending as cookie:", token);
  // res.status(200).cookie("jwt_organization", token).json({
  //   status: "success",
  //   message: "Logged In Successfully",
  // });
  const cookie = { name: "jwt_organization", value: token };
  const data = { status: "success", message: "Logged In Successfully", organization };
  respondWithCookie(res, 200, cookie, data);
});

// ROUTE: /users/logout | /organizations/logout | /verifiers/logout [GET]
exports.logout = (userType) => {
  return (req, res, next) => {
    const cookieName = `jwt_${userType.toLowerCase()}`;
    res.clearCookie(cookieName);
    res.status(200).json({ status: "Success", message: "Logged Out successfully" });
  };
};
// OR:
// exports.logout = (req, res, next) => {
//   // This middleware will be preceded by checkAuth(userType)
//   let userType;
//   if (req.user) userType = "user";
//   else if (req.organization) userType = "organization";

//   const cookieName = `jwt_${userType.toLowerCase()}`;
//   res.clearCookie(cookieName);
//   res.status(200).json({ status: "Success", message: "Logged Out successfully" });
// };

// ROUTE: /users/generate-token | /organizations/generate-token | /verifiers/generate-token [POST]
exports.mailPasswordResetToken = (userType) => {
  // This middleware requires email being sent in request body
  return catchAsync(async (req, res, next) => {
    const Model = userTypeToModel[userType];

    const doc = await Model.findOne({ email: req.body.email });
    if (!doc) throw new AppError(404, `No ${userType.toLowerCase()} associated with the email`);

    const token = await doc.generatePasswordResetToken();
    const message = `Enter this token to reset your password:\n${token}`;
    try {
      await sendMail({
        recipient: ["ankushbhowmikf12@gmail.com", "itsmeankush893@outlook.com", req.body.email],
        subject: "Reset Password Token (Valid for 10 minutes)",
        mailBody: message,
      });
      console.log("Mail sent successfully");
      res.status(200).json({
        status: "success",
        message: `Password Reset Token sent to your email at ${new Date().toLocaleString("en-UK", {
          timeZone: "Asia/Kolkata",
        })}`,
      });
    } catch (err) {
      await doc.discardPasswordResetToken();
      throw new AppError(500, err.message);
    }
  });
};

// ROUTE: /users/reset-password | /organizations/reset-password | /verifiers/reset-password [POST]:
// To be used when user is resetting forgotten passwor
exports.resetPassword = (userType) => {
  return catchAsync(async (req, res, next) => {
    // Requires new password and token from request body
    const { token, password } = req.body;

    // (1) Hash the token from request body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // (2) Find user via the hashed token
    const Model = userTypeToModel[userType];
    const doc = await Model.findOne({ passwordResetToken: hashedToken }).select(
      "+password +passwordResetTokenExpiry"
    );

    if (!doc) throw new AppError(400, "Invalid Token");
    console.log(`${userType} found`, doc);
    console.log(
      "Password Reset Token Expiry in IST: ",
      doc.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" })
    );

    // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now)
    if (doc.passwordResetTokenExpiry < Date.now())
      throw new AppError(400, "Token for updating password has expired");

    // (4) Check if password matches the existing one
    const isPasswordMatch = await doc.isPasswordCorrect(password);
    if (isPasswordMatch) throw new AppError(400, "New Password cannot be the same as current one");

    // (5) Proceed towards updating the password
    doc.password = password;
    await doc.save({ validateBeforeSave: true });
    await doc.discardPasswordResetToken();

    res.status(200).json({
      status: "success",
      message: "Password reset successfully! Please Log In",
    });
  });
};

// ROUTE: /users/update-password | /organizations/update-password | /verifiers/update-password [POST]
exports.updatePassword = (userType) => {
  return catchAsync(async (req, res, next) => {
    // Requires current password, new password and token from request body
    const { token, currentPassword, newPassword } = req.body;

    // (1) Hash the token from request body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // (2) Find user via the hashed token.
    const Model = userTypeToModel[userType];
    const doc = await Model.findOne({ passwordResetToken: hashedToken }).select(
      "+password +passwordResetTokenExpiry"
    );

    if (!doc) throw new AppError(401, "Invalid Token");
    console.log(`${userType} found`, doc);
    console.log(
      "Password Reset Token Expiry in IST: ",
      doc.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" })
    );

    // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now):
    if (doc.passwordResetTokenExpiry < Date.now())
      throw new AppError(400, "Token for updating password has expired");

    // (4) Check is currentPassword is same:
    const isPasswordMatch = await doc.isPasswordCorrect(currentPassword);
    if (!isPasswordMatch) throw new AppError(400, "Current Password is Incorrect!");

    // (5) New password shouldn't be the same as old password
    if (currentPassword === newPassword)
      throw new AppError(400, "New Password cannot be the same as current one");
    // Client-side has same validation, so it is likely not to be triggered

    // (6) Proceed towards updating the password
    doc.password = newPassword;
    await doc.save({ validateBeforeSave: true });
    await doc.discardPasswordResetToken();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully! Please Log In",
    });
  });
};

// ROUTE: /users
exports.getCurrentUser = (req, res, next) => {
  if (!req.user && !req.organization && !req.verifier)
    return res.status(404).json({ status: "fail", message: "No entity logged in!" });

  res.status(200).json({
    status: "success",
    // NOTE: One of the following will be set, rest will be undefined
    user: req.user,
    organization: req.organization,
    verifier: req.verifier,
  });
};

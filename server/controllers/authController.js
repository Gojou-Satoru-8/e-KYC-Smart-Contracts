/* eslint-disable import/no-extraneous-dependencies */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Verifier = require("../models/Verifier");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/sendMail");
const sendSMS = require("../utils/sendSMS");

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
  // console.log("Cookies: ", req.cookies);

  // let token;
  // let userType;
  // for (const [_userType] of Object.keys(userTypeToModel)) {
  //   const cookieName = `jwt_${userType.toLowerCase()}`;
  //   userType = _userType;
  //   token = req.cookies?.[cookieName];
  //   if (token) break;
  // }

  const userType = Object.keys(userTypeToModel).find(
    // (val) => Object.keys(req.cookies).includes(`jwt_${val.toLowerCase()}`)
    // (val) => req.cookies?.[`jwt_${val.toLowerCase()}`] !== undefined
    (val) => req.cookies?.[`jwt_${val.toLowerCase()}`]
  );

  console.log("Logged in Type found: ", userType);

  if (!userType) throw new AppError(401, "No entity is not logged in");
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
  const entity = await Model.findById(decoded.id);
  if (!entity) throw new AppError(`${userType} associated with the id no longer exists`);

  // (4) Check if password was changed after token generation:
  if (decoded.iat * 1000 < entity.lastPasswordChanged)
    throw new AppError(401, "Password changed after JWT was issued");

  req[userType.toLowerCase()] = entity; // req.user | req.organization | req.verifier
  next();
});

exports.restrictTo = (userType) => {
  // console.log("RESTRICTED TO: ", userType);
  return (req, res, next) => {
    if (!req[userType.toLowerCase()])
      throw new AppError(403, `Restricted Route! Access permitted to ${userType} only`);
    next();
  };
};

// ROUTE: api/users/login api/organizations/login api/verifiers/login [POST]
exports.signup = (userType) => {
  return catchAsync(async (req, res, next) => {
    // const { email, username, name, password, phoneNumber } = req.body; // For User
    // const { email, name, phoneNumber, address, password } = req.body; // For Organization

    const Model = userTypeToModel[userType];
    const createdDoc = await Model.create({ ...req.body });
    res.status(201).json({
      status: "success",
      message: `${userType} created successfully! Please login`,
      [userType.toLowerCase()]: createdDoc, // user: createdDoc or organization: createdDoc
    });
  });
};

// ROUTE: api/users/login [POST]
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

// ROUTE: api/organization/login [POST]:
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

// ROUTE: api/organization/login [POST]:
exports.verifierLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const verifier = await Verifier.findOne({ email }).select("+password");
  console.log(verifier);

  if (!verifier) throw new AppError(404, "No verifier found with this email");

  const isPasswordMatch = await verifier.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError(401, "Incorrect Password!");

  const token = signToken(verifier._id);
  console.log("JWT token for User before sending as cookie:", token);
  // res.status(200).cookie("jwt_verifier", token).json({
  //   status: "success",
  //   message: "Logged In Successfully",
  // });
  const cookie = { name: "jwt_verifier", value: token };
  const data = { status: "success", message: "Logged In Successfully", verifier };
  respondWithCookie(res, 200, cookie, data);
});

// ROUTE: api/users/logout | api/organizations/logout | api/verifiers/logout [GET]
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

// ROUTE: api/users/generate-password-token | api/organizations/generate-password-token | api/verifiers/generate-password-token [POST]
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

// ROUTE: api/users/reset-password | api/organizations/reset-password | api/verifiers/reset-password [POST]:
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

    if (!doc) throw new AppError(406, "Invalid Token");
    console.log(`${userType} found`, doc);
    console.log(
      "Password Reset Token Expiry in IST: ",
      doc.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" })
    );

    // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now)
    if (doc.passwordResetTokenExpiry < Date.now())
      throw new AppError(406, "Token for updating password has expired");

    // (4) Check if password matches the existing one
    const isPasswordMatch = await doc.isPasswordCorrect(password);
    if (isPasswordMatch) throw new AppError(406, "New Password cannot be the same as current one");

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

// ROUTE: api/users/update-password | api/organizations/update-password | api/verifiers/update-password [POST]
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

    if (!doc) throw new AppError(406, "Invalid Token");
    console.log(`${userType} found`, doc);
    console.log(
      "Password Reset Token Expiry in IST: ",
      doc.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" })
    );

    // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now):
    if (doc.passwordResetTokenExpiry < Date.now())
      throw new AppError(406, "Token for updating password has expired");

    // (4) Check is currentPassword is same:
    const isPasswordMatch = await doc.isPasswordCorrect(currentPassword);
    if (!isPasswordMatch) throw new AppError(406, "Current Password is Incorrect!");

    // (5) New password shouldn't be the same as old password
    if (currentPassword === newPassword)
      throw new AppError(406, "New Password cannot be the same as current one");
    // Client-side has same validation, so it is likely not to be triggered

    // (6) Proceed towards updating the password
    doc.password = newPassword;
    await doc.save({ validateBeforeSave: true });
    await doc.discardPasswordResetToken();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully!",
    });
  });
};

// ROUTE: api/users [GET]
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

// ROUTE: api/users/ [PATCH]

exports.updateEntity = (userType) => {
  return catchAsync(async (req, res, next) => {
    // const { username, name} = req.body;
    // NOTE: Primarily meant for updating username and name (for now), as updation of other fields
    // have dedicated middlewares
    const Model = userTypeToModel[userType];

    const entityId = req[userType.toLowerCase()]._id; // req.user._id | req.verifier._id | req.organization._id

    const updatedEntity = await Model.findByIdAndUpdate(
      entityId,
      { ...req.body },
      { runValidators: true, new: true }
    );

    if (!updatedEntity) throw new AppError(401, "User is not logged in");
    // Will be handled by the checkAuth middleware
    res.status(200).json({
      status: "success",
      message: "User Updated Successfully",
      entity: updatedEntity,
      // entityType: userType,
    });
  });
};

// ROUTE: /api/users/generate-key-token [GET]
exports.mailPublicKeyResetToken = catchAsync(async (req, res, next) => {
  // This is different from mailing password-reset token, as this exclusively requires the user to be logged in
  // Hence we already have the user document, thus this requires a GET request.

  // const user = await User.findOne({ email: req.user.email });
  // if (!user) throw new AppError(404, `No user associated with the email`);
  // const {user} = req;  // Use this instead of above lines
  const token = await req.user.generatePublicKeyResetToken();
  const message = `Enter this token to re-generate your keys:\n${token}`;
  try {
    await sendMail({
      recipient: ["ankushbhowmikf12@gmail.com", "itsmeankush893@outlook.com", req.user.email],
      subject: "Reset Public-Key Token (Valid for 10 minutes)",
      mailBody: message,
    });
    console.log("Mail sent successfully");
    res.status(200).json({
      status: "success",
      message: `Public-Key reset token sent to your email at ${new Date().toLocaleString("en-UK", {
        timeZone: "Asia/Kolkata",
      })}`,
    });
  } catch (err) {
    await req.user.discardPublicKeyResetToken();
    throw new AppError(500, err.message);
  }
});

// ROUTE: /api/users/update-key [POST]
exports.updatePublicKey = catchAsync(async (req, res, next) => {
  /*
  // NOTE: Not necessary
  console.log("Before sanitizing: ", req.body);
  if (req.body.publicKey) req.body.publicKey = req.body.publicKey.replace(/\r\n/g, "\n");
  console.log("After saniziting: ", req.body);
  */
  const { token, publicKey } = req.body;
  if (!token) throw new AppError(404, "Missing Token");
  // if (!publicKey) throw new AppError(404, "Missing Public Key");
  // NOTE: Remove this in production environment, as this will be generated by client code and not mannually input by user.

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ publicKeyResetToken: hashedToken }).select(
    "+publicKey +publicKeyResetTokenExpiry"
  );
  if (!user) throw new AppError(406, "Invalid Token");
  console.log("User found", user);
  console.log(
    "Public-key Reset Token Expiry in IST: ",
    user.publicKeyResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" })
  );

  // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now):
  if (user.publicKeyResetTokenExpiry < Date.now())
    throw new AppError(400, "Token for updating keys has expired");

  // (4) Proceed towards updating the password
  user.publicKey = publicKey;
  await user.save({ validateBeforeSave: true });
  await user.discardPublicKeyResetToken();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully!",
  });
});

const multerFilter = (req, file, cb) => {
  console.log("------------- Multer Filter middleware:");
  console.log({ file });

  if (file.mimetype.startsWith("image"))
    cb(null, true); // Proceed to next middleware
  else {
    console.log("Image unaccepted for this file: ", file);
    cb(new AppError(400, "Unaccepted File type"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
});

// ROUTE: /users/update-pfp [POST]  // All following middlwares are used in sequence:
exports.uploadPfp = upload.single("pfp");

exports.resizeUserPhoto = (req, res, next) => {
  // As only a single file was uploaded, it's available in req.file, in case of multiple uploads, it's req.files.
  console.log("Photo: ", req.file);
  if (!req.file) throw new AppError("No photo uploaded", 400, "JSON");

  // NOTE: Since we're using memoryStorage(), thus there is no filename appended to file Object,
  // as done by filename middleware in diskstorage() options. Thus we gotta set it manually.
  // const fileExt = req.file.mimetype.split("/").at(-1);
  // req.file.filename = `user-${user.id}-${req.file.originalname}.${fileExt}`;
  req.file.filename = `user-${req.user.id}.jpeg`;
  // NOTE: Extension is fixed to jpeg as we're saving as jpeg after processing via sharp.
  // console.log("File Before resizing: ", req.file);
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.resolve(__dirname, "..", "dist", "src", "user-images", req.file.filename));
  next();
};

exports.updatePfp = catchAsync(async (req, res, next) => {
  console.log("User Photo: ", req.file); // Has filename attribute crucially.

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { photo: req.file.filename },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .json({ status: "success", message: "Pfp Changed Successfully", user: updatedUser });
});

// NOTE: Email and Phone-Number Verification for User:

// ROUTE: /api/users/email-verification-token [GET]
exports.mailEmailVerificationToken = catchAsync(async (req, res, next) => {
  // This is different from mailing password-reset token, as this exclusively requires the user to be logged in
  // Hence we already have the user document, thus this requires a GET request.
  const payload = { id: req.user.id, purpose: "verification", type: "email" };
  const token = jwt.sign(payload, process.env.JWT_SHARE_KEY, {
    expiresIn: process.env.JWT_SHARE_KEY_EXPIRES_IN,
  });
  console.log("EMAIL VERIFICATION TOKEN: ", token);

  const message = `Enter this token to verify your E-mail:\n${token}`;
  try {
    await sendMail({
      recipient: ["ankushbhowmikf12@gmail.com", "itsmeankush893@outlook.com", req.user.email],
      subject: "E-mail verification Token (Valid for 10 minutes)",
      mailBody: message,
    });
    console.log("Mail sent successfully");
    res.status(200).json({
      status: "success",
      message: `E-mail verification token sent to your email at ${new Date().toLocaleString(
        "en-UK",
        { timeZone: "Asia/Kolkata" }
      )}`,
    });
  } catch (err) {
    throw new AppError(500, err.message);
  }
});

// ROUTE: /api/users/email-verification-token  [POST]
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) throw new AppError(404, "Missing Token");

  const decoded = jwt.verify(token, process.env.JWT_SHARE_KEY);
  console.log("Decoded Token: ", decoded);

  if (decoded.purpose !== "verification" || decoded.type !== "email")
    throw new AppError(406, "Invalid Token purpose");

  if (decoded.id !== req.user.id) throw new AppError(406, "Invalid Token! Not meant for this user");

  const verifiedUser = await User.findByIdAndUpdate(
    req.user.id,
    { isEmailVerified: true },
    { new: true, runValidators: true }
  );

  if (!verifiedUser) throw new AppError(404, "Invalid Token");

  res.status(200).json({
    status: "success",
    message: "User's E-mail verified successfully",
    user: verifiedUser,
  });
});

// ROUTE: /api/users/phone-verification-token [GET]
exports.smsPhoneVerificationToken = catchAsync(async (req, res, next) => {
  // This is different from mailing password-reset token, as this exclusively requires the user to be logged in
  // Hence we already have the user document, thus this requires a GET request.
  const payload = { id: req.user.id, purpose: "verification", type: "phone" };
  const token = jwt.sign(payload, process.env.JWT_SHARE_KEY, {
    expiresIn: process.env.JWT_SHARE_KEY_EXPIRES_IN,
  });
  console.log("PHONE VERIFICATION TOKEN: ", token);

  const message = `Enter this token to verify your phone number:\n${token}`;
  try {
    await sendSMS({
      recipient: req.user.phoneNumber,
      msgBody: message,
    });
    console.log("SMS sent successfully");
    res.status(200).json({
      status: "success",
      message: `Phone verification token sent via sms to your phone number ${new Date().toLocaleString(
        "en-UK",
        { timeZone: "Asia/Kolkata" }
      )}`,
    });
  } catch (err) {
    throw new AppError(500, err.message);
  }
});

// ROUTE: /api/users/phone-verification-token [POST]
exports.verifyPhone = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) throw new AppError(404, "Missing Token");

  const decoded = jwt.verify(token, process.env.JWT_SHARE_KEY);
  console.log("Decoded Token: ", decoded);

  if (decoded.purpose !== "verification" || decoded.type !== "phone")
    throw new AppError(406, "Invalid Token purpose");

  if (decoded.id !== req.user.id) throw new AppError(406, "Invalid Token! Not meant for this user");

  const verifiedUser = await User.findByIdAndUpdate(
    req.user.id,
    { isPhoneNumberVerified: true },
    { new: true, runValidators: true }
  );

  if (!verifiedUser) throw new AppError(404, "Invalid Token");

  res.status(200).json({
    status: "success",
    message: "User's phone number verified successfully",
    user: verifiedUser,
  });
});

const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Email is a required field"],
      validate: [validator.isEmail, "Invalid Email"],
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Username is a required field"],
      validate: [validator.isAlphanumeric, "Invalid Username"],
      minLength: [3, "Username must have atleast 3 characters"],
      maxLength: [15, "Username cannot exceed 15 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is a required field"],
      trim: true,
      validate: {
        validator: function (val) {
          // Original simple regex: /^[A-Z][a-z]+ [A-z][a-z]+$/ [Accounts for firstName+lastName with alphabets only]
          // const regex =
          //   /^[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?\s[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?$/;
          // return regex.test(val);  // This accounts for names like John O'Connor, John Levy-Hamilton
          // OR:
          return (
            val.search(
              /^[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?\s[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?$/
            ) !== -1
          );
        },
        message: "Please enter a valid name.",
      },
      minLength: [3, "Name must have minimum 3 characters"],
      maxLength: [20, "Name must not exceed 20 characters"],
    },
    phoneNumber: { type: String, required: [true, "User must provide a phone number"] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneNumberVerified: { type: Boolean, default: false },
    photo: { type: String, default: "/src/assets/account-image.png" },
    publicKey: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    password: {
      type: String,
      required: [true, "Password is a required field"],
      validate: [
        validator.isStrongPassword,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 digit and 1 special character",
      ],
      minLength: [8, "Password must have minimum 8 characters"],
      maxLength: [20, "Password must not exceed 20 characters"],
      select: false,
    },
    lastPasswordChanged: {
      type: Date,
      select: false,
      // default: Date.now
    },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiry: { type: Date, select: false },
    publicKeyResetToken: { type: String, select: false },
    publicKeyResetTokenExpiry: { type: Date, select: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.index({ email: 1 });
// MONGOOSE METHODS:
UserSchema.methods.isPasswordCorrect = async function (password) {
  // return await bcrypt.compare(password, this.password);
  // As async function always returns a promise, there is no need to resolve it here, leading to being promisified again
  // The function shall return the promise, and on promise-flattening, the calling side will just need to await it.
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generatePasswordResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiry =
    Date.now() + Number.parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000;
  await this.save({ validateBeforeSave: false });
  // console.log("User after generating a reset token: ", this);
  console.log("Info about Password Reset Token generated:\n", {
    token,
    hashedToken,
    expiry: this.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  });

  return token;
};

UserSchema.methods.discardPasswordResetToken = async function () {
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

UserSchema.methods.generatePublicKeyResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.publicKeyResetToken = hashedToken;
  this.publicKeyResetTokenExpiry =
    Date.now() + Number.parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000;
  await this.save({ validateBeforeSave: false });
  // console.log("User after generating a reset token: ", this);
  console.log("Info about Password Reset Token generated:\n", {
    token,
    hashedToken,
    expiry: this.publicKeyResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  });

  return token;
};

UserSchema.methods.discardPublicKeyResetToken = async function () {
  this.publicKeyResetToken = undefined;
  this.publicKeyResetTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.lastPasswordChanged) {
    const changedTimestamp = Number.parseInt(this.lastPasswordChanged / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// MONGOOSE MIDDLEWARES:
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.lastPasswordChanged = Date.now();
  next();
});
UserSchema.pre(/^find/, async function (next) {
  this.select("-__v");
  next();
});
const User = mongoose.model("User", UserSchema);
module.exports = User;

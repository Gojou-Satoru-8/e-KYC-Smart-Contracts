const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcrypt");

const OrganizationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is a required field"],
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Invalid Email"],
      // validate: { validator: validator.isEmail, message: "Please enter a valid email" },
    },
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Organization Name is a required field"],
      validate: {
        validator: function (val) {
          // Original simple regex: /^[A-Z][a-z]+ [A-z][a-z]+$/ [Accounts for firstName+lastName with alphabets only]
          // const regex =
          //   /^[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?\s[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?$/;
          // return regex.test(val);  // This accounts for names like John O'Connor, John Levy-Hamilton
          // OR:
          // return (
          //   val.search(
          //     /^[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?\s[A-Z][a-zA-Z]*(?:[-'][A-Z][a-zA-Z]*)?$/
          //   ) !== -1
          // );
        },
        message: "Please enter a valid name.",
      },
      minLength: [3, "Organization name must have minimum 3 characters"],
      maxLength: [30, "Organization name cannot exceed 30 characters"],
    },

    phoneNumber: {
      type: String,
      validate: [validator.isMobilePhone, "Invalid Phone number"],
      required: [true, "Organization must have a phone number"],
    },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// MONGOOSE METHODS:
OrganizationSchema.methods.isPasswordCorrect = async function (password) {
  // return await bcrypt.compare(password, this.password);
  return bcrypt.compare(password, this.password);
};

OrganizationSchema.methods.generatePasswordResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiry =
    Date.now() + Number.parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000;
  await this.save({ validateBeforeSave: false });
  // console.log("Organization after generating a reset token: ", this);
  console.log("Info about Password Reset Token generated:\n", {
    token,
    hashedToken,
    expiry: this.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  });

  return token;
};

OrganizationSchema.methods.discardPasswordResetToken = async function () {
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

OrganizationSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.lastPasswordChanged) {
    const changedTimestamp = Number.parseInt(this.lastPasswordChanged / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// MONGOOSE MIDDLEWARES:
OrganizationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.lastPasswordChanged = Date.now();

  next();
});

const Organization = mongoose.model("Organization", OrganizationSchema);
module.exports = Organization;

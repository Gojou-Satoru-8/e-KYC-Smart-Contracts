const mongoose = require("mongoose");

const KYCDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Document should be linked with a user"],
    },
    // organization: { type: mongoose.Schema.ObjectId, ref: "Organization", required: true },
    type: {
      type: String,
      enum: {
        values: ["Passport", "Voter ID", "Driver License", "Aadhar"],
        message: "Document be any of Passport | VoterID | Driver License | Aadhar",
      },
      required: [true, "Document must have a type"],
    },
    path: { type: String, required: [true, "File Path must be provided"] },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Approved", "Rejected"],
        message: "Status must be any of Pending | Approved | Rejected",
      },
      default: "Pending",
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.ObjectId, ref: "Verifier" },
    rejectionReason: { type: String },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

KYCDocumentSchema.virtual("isVerified").get(function () {
  return this.status !== "Pending";
});

KYCDocumentSchema.virtual("blockchainRecord", {
  ref: "BlockchainRecord",
  localField: "_id",
  foreignField: "document",
  justOne: true,
});

const KYCDocument = mongoose.model("KYCDocument", KYCDocumentSchema);
module.exports = KYCDocument;

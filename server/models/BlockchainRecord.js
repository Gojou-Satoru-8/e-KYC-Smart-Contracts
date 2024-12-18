const mongoose = require("mongoose");

const BlockchainRecordSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: [true, "Record must be associated with a User"],
  // },
  document: {
    type: mongoose.Schema.ObjectId,
    ref: "KYCDocument",
    required: [true, "Record must be associated with a KYC Document of a certain User"],
  },
  documentIdHash: { type: String, required: [true, "Document ID Hash is a required field"] },
  documentHash: { type: String, required: [true, "Document hash is a required field"] },
  blockHash: { type: String, required: [true, "Block hash is a required field"] },
  transactionHash: { type: String, required: [true, "Transaction Hash is a required field"] },
  recordedAt: { type: Date, default: Date.now },
});

const BlockchainRecord = mongoose.model("BlockchainRecord", BlockchainRecordSchema);
module.exports = BlockchainRecord;

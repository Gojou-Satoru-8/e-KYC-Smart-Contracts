const mongoose = require("mongoose");

const BlockchainRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Record must be associated with a User"],
  },
  document: {
    type: mongoose.Schema.ObjectId,
    ref: "KYCDocument",
    required: [true, "Record must be associated with a KYC Document of a certain User"],
  },
  blockchainHash: { type: String, required: [true, "Blockchain hash is a required field"] },
  // Document Hash stored on blockchain
  transactionId: { type: String, required: [true, "Transaction ID is a required field"] },
  recordedAt: { type: Date, default: Date.now },
});

const BlockchainRecord = mongoose.Model("BlockchainRecord", BlockchainRecordSchema);
module.exports = BlockchainRecord;

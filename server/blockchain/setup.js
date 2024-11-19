// Web3.js Setup
require("dotenv").config();
const { Web3 } = require("web3");
const ABI = require("./abi.json");
const AppError = require("../utils/AppError");

// const setupWeb3 = () => {
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const contract = new web3.eth.Contract(ABI, process.env.ETHEREUM_CONTRACT_ADDRESS);

const approveOnChain = async (documentId, documentContentsHex) => {
  // NOTE: Both documentId and documentContentsHex should be string values
  try {
    const documentIdHash = web3.utils.keccak256(documentId);
    const documentHash = web3.utils.keccak256(documentContentsHex);
    const tx = await contract.methods
      .verifyDocument(documentIdHash, documentHash)
      .send({ from: account.address });
    console.log("Transaction Object: ", tx);

    const block = await web3.eth.getBlock(tx.blockNumber);
    return {
      documentIdHash,
      documentHash,
      transactionHash: tx.transactionHash,
      blockHash: tx.blockHash,
      recordedAt: new Date(Number(block.timestamp) * 1000),
    };
  } catch (err) {
    console.error("Blockchain transaction failed:", err);
    throw new AppError(500, `Blockchain transaction failed: ${err.message}`);
  }
};

// return { web3, contract, verifyOnChain };
// };

const checkApprovedOnChain = async (documentId, { type }) => {
  // NOTE: We pass type: "hash" if documentId is already Hashed

  try {
    const documentIdHash = type === "hash" ? documentId : web3.utils.keccak256(documentId);
    // if (!documentIdHash) documentIdHash = web3.utils.keccak256(documentId);
    const verification = await contract.methods.checkVerification(documentIdHash).call();
    console.log("Verification Object from view function:", verification);

    return {
      documentHash: verification.hash,
      verifiedAt: new Date(Number(verification.timestamp) * 1000),
    };
  } catch (err) {
    console.error("Blockchain view verification failed: ", err);
    throw new AppError(500, `Blockchain view verification failed: ${err.message}`);
  }
};
/*
// Ethers.js Setup
const { ethers } = require("ethers");

// const setupEthers = () => {
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_NODE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

const verifyOnChain = async (document, verificationDetails) => {
  const documentId = ethers.utils.id(document._id.toString());
  const documentHash = ethers.utils.id(JSON.stringify(verificationDetails));

  const tx = await contract.verifyDocument(documentId, documentHash);
  const receipt = await tx.wait();

  return receipt.transactionHash;
};

return { provider, contract, verifyOnChain };
// };
*/

module.exports = {
  //   setupWeb3,
  //   setupEthers,
  approveOnChain,
  checkApprovedOnChain,
};

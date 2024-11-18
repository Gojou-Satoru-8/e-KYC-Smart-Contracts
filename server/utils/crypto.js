const crypto = require("crypto");

exports.verifySignature = (document, signature, publicKeyPem) => {
  try {
    // Create the same hash
    const verifier = crypto.createVerify("SHA256");
    verifier.update(document);

    // Decode base64 signature
    const signatureBuffer = Buffer.from(signature, "base64");

    // Verify
    return verifier.verify(publicKeyPem, signatureBuffer);
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
};

exports.createDocumentHash = (document) => {
  // Here, document is the file-buffer (example: req.file.buffer)
  try {
    const hashFunction = crypto.createHash("sha256");
    hashFunction.update(document);
    const hash = hashFunction.digest("hex");
    return hash;
  } catch (err) {
    console.log("Hashing Error: ", err);
    throw err;
  }
};

// console.log(crypto.randomBytes(32).toString("hex"));
/*
// FOR TESTING CONTRACT ON REMIX USING DOCUMENT HASH:
const fsPromises = require("fs/promises");

console.log("Enter the path of the document to hash: ");

process.stdin.on("data", async (data) => {
  console.log(data.toString()); // Path

  const fileContentsBuffer = await fsPromises.readFile(data.toString().slice(0, -1));
  console.log(fileContentsBuffer);

  const hashedFileContents = this.createDocumentHash(fileContentsBuffer);
  // const hashedFileContents = this.createDocumentHash("6734e5ba4a3533c7d39f14a5");
  console.log(hashedFileContents);

  // fs.readFile("path", (err, data) => {
  //   console.log(data); // Buffer
  //   const hashedContents = this.createDocumentHash(data);
  //   console.log(hashedContents);
  // });

  process.exit();
});

process.on("exit", (code) => {
  console.log("Process exited with code: ", code);
});
*/

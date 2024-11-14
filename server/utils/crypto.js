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

// const crypto = require("crypto");

// console.log(crypto.randomBytes(32).toString("hex"));

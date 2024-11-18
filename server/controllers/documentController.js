const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");
const fsPromises = require("fs/promises");
const path = require("path");
const KYCDocument = require("../models/KYCDocuments");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifySignature } = require("../utils/crypto");

// ROUTE: /api/documents/all [GET] - Restricted to verifiers only:
exports.getAllDocuments = catchAsync(async (req, res, next) => {
  const documents = await KYCDocument.find().populate("user verifiedBy");
  console.log(documents);

  if (documents.length === 0) throw new AppError(404, "No documents in the DB");

  res.status(200).json({
    status: "success",
    message: "All Documents retrieved successfully",
    documents,
  });
});

// ROUTE: /api/documents/ [GET] - Restricted To users only:
exports.getDocumentsByUser = catchAsync(async (req, res, next) => {
  // This middleware will be preceded by checkAuth, and will only give info from KYCDocument schema, ie only the path
  // and the actual file content (which stays encrypted on-disk) isn't served.
  const documents = await KYCDocument.find({ user: req.user._id }).populate("verifiedBy");
  console.log(documents);

  if (documents.length === 0) throw new AppError(404, "No documents submitted by the user yet");

  res.status(200).json({
    status: "success",
    message: "Documents retrieved successfully",
    documents,
  });
});

/*
// ROUTE: /api/documents/:id [POST]
exports.getDocument = catchAsync(async (req, res, next) => {
  const document = await KYCDocument.findById(req.params.id);
  if (!document) throw new AppError(404, "No document associated with the ID");

  // Step 1: Read and decrypt the encrypted file
  const encryptedBuffer = await fsPromises.readFile(document.path);
  const decryptedBuffer = crypto.publicDecrypt(req.user.publicKey, encryptedBuffer);

  // Step 2: Set headers for PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');
  // Step 3: Send the decrypted buffer
  res.send(decryptedBuffer);
});
*/

// ROUTE: /api/documents/:id [DELETE]
exports.deleteDocument = catchAsync(async (req, res, next) => {
  // const { id } = req.params;

  const docToDelete = await KYCDocument.findById(req.params.id);
  console.log("DOCUMENT TO DELETE: ", docToDelete);

  if (!docToDelete) throw new AppError(404, "No such document with the provided ID");
  if (docToDelete.status === "Approved")
    throw new AppError(406, "Cannot delete an approved document");

  await docToDelete.deleteOne();
  // res.status(204).json({
  res.status(204).json({
    status: "success",
    message: "Document deleted successfully",
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept the file
    } else {
      cb(new AppError(400, "Unaccepted File Format (only PDF Accepted)"), false); // Reject the file
    }
  },
});

// ROUTE: /api/documents [POST]  // All following middlwares are used in sequence
exports.uploadDocument = upload.single("document");
/*
exports.testDocumentUpload = (req, res, next) => {
  console.log("Request Body: ", req.body);
  console.log("File: ", req.file);
  // console.log("File Contents in string:\n", req.file.buffer.toString()); // Use this in case of .txt or .md files

  res.status(200).json({
    status: "success",
    file: req.file,
  });
};
*/

exports.verifyAuthenticity = catchAsync(async (req, res, next) => {
  // const { signature } = req.body;
  // const { file } = req;
  console.log("VERIFY AUTHENTICITY MIDDLEWARE:");
  console.log("USER: ", req.user);
  console.log("FILE: ", req.file);
  console.log("SIGNATURE: ", req.body.signature);

  const isValid = verifySignature(
    req.file.buffer, // Original document
    req.body.signature, // Base64 signature from client
    req.user.publicKey // User's public key PEM
  );

  if (!isValid) {
    throw new AppError(406, "Invalid signature");
  }
  console.log("SIGNATURE VERIFIED");

  next();
});

/*
exports.checkDocumentHash = catchAsync((req, res, next) => {
  // NOTE: User sends a signature, an base (unsigned) documentHash, and the document - encrypted with their private-key
  // The signature is a private-key ecrypted version of the documentHash.
  // We decrypt the signature with the public key, and verify if the hash obtained is the same as the base documentHash
  // from client.
  //   const { documentHash } = req.body;

  // SECTION: Server-side encryption  :
  // Hash the file buffer, decrypt (with public key) the incoming signature from req.body and compare:
  const hashedDoc = crypto.createHash("sha256").update(req.file.buffer).digest(); // Buffer
  const decryptedHash = crypto.publicDecrypt(req.user.publicKey, req.body.signature); // Buffer
  if (!hashedDoc.equals(decryptedHash)) throw new AppError(401, "Incorrect key provided!");
  // NOTE: We could also convert to String of "hex" type using .digest("hex") in hashedDoc, and .toString("hex")
  // in decryptedHash, and then compare:
  //   if (hashedDoc !== decryptedHash) throw new AppError(401, "Incorrect key provided!");

  
  // const signatureRaw = Buffer.from(req.body.signature, "base64");
  // const documentHashRaw = Buffer.from(req.body.documentHash, "base64");
  // const decryptedHash = crypto.publicDecrypt(req.user.publicKey, signatureRaw);
  // if (!decryptedHash.equals(documentHashRaw)) throw new AppError(401, "Incorrect key provided");

  // NOTE: This process works directly with req.body.signature and req.body.documentHash (ie no need to convert to
  // Buffer), if the client doesn't send data in base64 format. But for safety, we use base64 in the client side
  next();
});
*/

/*
// NOTE: Not required as encryption will be done from the client side with user's private key.
// And on download, the decryption will take place with the stored public key
exports.encryptDocument = catchAsync(async (req, res, next) => {
  // Needs req.user's public key, req.file from multer's upload.single("document"), and documentType in req.body
  console.log("Uploaded file before encryption: ", req.file);

  // NOTE: As we're using multer's memoryStorage, req.file doesn't have the fileName ie path where the file is stored.
  req.file.fileName = `${req.user._id}-${req.body.documentType}.pdf`;

  const encryptedBuffer = crypto.publicEncrypt(req.user.publicKey, req.file.buffer); // maybe add .toString("hex")
  await fsPromises.writeFile(
    path.join(__dirname, "..", "public", "documents", req.file.fileName),
    encryptedBuffer
  );
  next();
});
*/

exports.encryptDocumentAndSave = catchAsync(async (req, res, next) => {
  // Generate random IV (Initialization Vector)
  console.log("PLATFORM_SECRET_KEY: ", process.env.PLATFORM_SECRET_KEY);
  const key = Buffer.from(process.env.PLATFORM_SECRET_KEY, "hex");

  const iv = crypto.randomBytes(16);

  // Create cipher with platform key and IV
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // Encrypt the document
  const encryptedBuffer = Buffer.concat([
    iv, // Store IV with the file
    cipher.update(req.file.buffer),
    cipher.final(),
    cipher.getAuthTag(), // Store auth tag for verification
  ]);

  // NOTE: As we're using multer's memoryStorage, req.file doesn't have the fileName ie path where the file is stored.
  req.file.fileName = `${req.user._id}-${req.body.documentType}.pdf`;
  // Save encrypted file
  await fsPromises.writeFile(
    path.join(__dirname, "..", "documents", req.file.fileName),
    encryptedBuffer
  );

  next();
});

exports.postDocument = catchAsync(async (req, res, next) => {
  const newDoc = await KYCDocument.create({
    user: req.user._id,
    type: req.body.documentType,
    path: req.file.fileName,
  });
  console.log(newDoc);

  res.status(201).json({
    status: "success",
    message: "Document uploaded and saved successfully",
    document: newDoc,
  });
});

// ROUTE: /api/dpcuments/:id [GET]
exports.downloadDocumentById = catchAsync(async (req, res, next) => {
  // const {id} = req.params;

  if (!req.params.id) throw new AppError(400, "Missing Document ID");

  const document = await KYCDocument.findById(req.params.id);
  if (!document) throw new AppError(404, "No document with the provided ID");

  console.log(document);

  const documentPath = path.join(__dirname, "..", "documents", document.path);
  const encryptedBuffer = await fsPromises.readFile(documentPath);

  // Extract components
  const iv = encryptedBuffer.slice(0, 16); // First 16 bytes is IV
  const authTag = encryptedBuffer.slice(-16); // Last 16 bytes is auth tag
  const encryptedContent = encryptedBuffer.slice(16, -16); // Everything in between

  const key = Buffer.from(process.env.PLATFORM_SECRET_KEY, "hex");

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decryptedBuffer = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

  // Set headers for PDF
  res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');
  res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
  // Send the decrypted buffer
  res.send(decryptedBuffer);
});

// ROUTE: /all/:id [PATCH]
exports.updateStatus = catchAsync(async (req, res, next) => {
  // const {id} = req.params;
  // const {status} = req.body;
  console.log("TRIGGERED UPDATE STATUS", req.body); // status and rejectionReason

  if (!req.params.id) throw new AppError(400, "Missing Document ID");

  if (!req.body.status) throw new AppError(406, "Missing Status");

  const updatedDocument = await KYCDocument.findByIdAndUpdate(
    req.params.id,
    { ...req.body, verifiedAt: Date.now(), verifiedBy: req.verifier._id },
    { runValidators: true, new: true }
  );
  if (!updatedDocument) throw new AppError(404, "No document with the provided ID");

  // console.log(updatedDocument);

  res.status(200).json({
    status: "success",
    message: "Document Status updated successfully",
    document: updatedDocument,
  });
});

// ROUTE: /api/documents/share/ [POST] - Restricted to User only
exports.generateShareCode = catchAsync(async (req, res, next) => {
  const { organizationId, documentId } = req.body;

  if (!documentId) throw new AppError(404, "Missing Document ID");
  if (!organizationId) throw new AppError(404, "Missing Organization ID");

  const document = await KYCDocument.findById(documentId);
  if (!document.status === "Approved")
    throw new AppError(403, "Document is not approved! Thus cannot be shared");

  const payload = { userId: req.user.id, organizationId: organizationId, documentId: documentId };
  const token = jwt.sign(payload, process.env.JWT_SHARE_KEY, {
    expiresIn: process.env.JWT_SHARE_KEY_EXPIRES_IN,
  });
  console.log("SHARE TOKEN: ", token);

  res.status(200).json({ status: "success", message: "Share Token Generated", token });
});

// ROUTE: /api/documents/share/:token [GET] - Restricted to Organization only
exports.getSharedDocument = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) throw new AppError(404, "Missing share token/code");

  const decoded = jwt.verify(token, process.env.JWT_SHARE_KEY);
  console.log("Original payload inside share token/code: ", decoded);

  if (decoded.organizationId !== req.organization.id)
    throw new AppError(403, "Forbidden Access to this Organization.");

  const document = await KYCDocument.findOne({ _id: decoded.documentId, user: decoded.userId });
  // NOTE: Here it is possible to get document by id only, but as a safety parameter, we include the userId so that
  // a user can only share his own document, even if he gets someone else's document.

  if (!document) throw new AppError(404, "No such document with this share token");

  res.status(200).json({
    status: "success",
    message: "Document retrieved successfully",
    document,
  });
});

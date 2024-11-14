const express = require("express");
const authController = require("../controllers/authController");
const documentController = require("../controllers/documentController");

const router = express.Router({ mergeParams: true });

router.use(authController.checkAuth);
router.route("/all").get(authController.restrictTo("Verifier"), documentController.getAllDocuments);
router.route("/").get(documentController.getDocumentsByUser).post(
  documentController.uploadDocument,
  //   documentController.testDocumentUpload,
  documentController.verifyAuthenticity,
  documentController.encryptDocumentAndSave,
  documentController.postDocument
);
router.route("/:id").get(documentController.downloadDocumentById);

module.exports = router;

const express = require("express");
const authController = require("../controllers/authController");
const documentController = require("../controllers/documentController");

const router = express.Router({ mergeParams: true });

router.use(authController.checkAuth);
router.route("/all").get(authController.restrictTo("Verifier"), documentController.getAllDocuments);
router
  .route("/all/:id")
  .patch(authController.restrictTo("Verifier"), documentController.updateStatus);

router
  .route("/")
  .get(authController.restrictTo("User"), documentController.getDocumentsByUser)
  .post(
    authController.restrictTo("User"),
    documentController.uploadDocument,
    //   documentController.testDocumentUpload,
    documentController.verifyAuthenticity,
    documentController.encryptDocumentAndSave,
    documentController.postDocument
  );
router.route("/:id").get(documentController.downloadDocumentById);

router
  .route("/share")
  .post(authController.restrictTo("User"), documentController.generateShareCode);
router
  .route("/share/:token")
  .get(authController.restrictTo("Organization"), documentController.getSharedDocument);
module.exports = router;

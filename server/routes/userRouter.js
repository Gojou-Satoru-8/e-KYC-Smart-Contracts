const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(authController.signup("User"));
router.route("/login").post(authController.userLogin);
router.route("/logout").get(authController.logout("User"));
router.route("/generate-password-token").post(authController.mailPasswordResetToken("User"));
router.route("/reset-password").post(authController.resetPassword("User"));

router.use(authController.checkAuth, authController.restrictTo("User"));
// NOTE: The following routes require authentication and restricted to User entityType (User must be logged in)
router.route("/").get(authController.getCurrentUser).patch(authController.updateEntity("User"));
//   .delete(authController.deleteUser);
router.route("/update-password").post(authController.updatePassword("User"));
router.route("/generate-key-token").get(authController.mailPublicKeyResetToken);
router.route("/update-key").post(authController.updatePublicKey);
router
  .route("/update-pfp")
  .post(authController.uploadPfp, authController.resizeUserPhoto, authController.updatePfp);
router
  .route("/email-verification-token")
  .get(authController.mailEmailVerificationToken)
  .post(authController.verifyEmail);
router
  .route("/phone-verification-token")
  .get(authController.smsPhoneVerificationToken)
  .post(authController.verifyPhone);
module.exports = router;

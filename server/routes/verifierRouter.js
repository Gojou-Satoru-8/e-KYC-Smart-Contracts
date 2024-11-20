const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(authController.signup("Verifier"));
router.route("/login").post(authController.verifierLogin);
router.route("/logout").get(authController.logout("Verifier"));
router.route("/generate-password-token").post(authController.mailPasswordResetToken("Verifier"));
router.route("/reset-password").post(authController.resetPassword("Verifier"));

router.use(authController.checkAuth, authController.restrictTo("Verifier"));
// NOTE: The following routes require authentication (Verifier must be logged in)
// router.route("/:id").patch(authController.updateVerifier).delete(authController.deleteVerifier);
router.route("/").patch(authController.updateEntity("Verifier"));
router.route("/update-password").post(authController.updatePassword("Verifier"));

module.exports = router;

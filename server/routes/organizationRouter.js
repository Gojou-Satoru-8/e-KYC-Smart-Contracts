const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(authController.signup("Organization"));
router.route("/login").post(authController.organizationLogin);
router.route("/logout").get(authController.logout("Organization"));
router
  .route("/generate-password-token")
  .post(authController.mailPasswordResetToken("Organization"));
router.route("/reset-password").post(authController.resetPassword("Organization"));

router.use(authController.checkAuth, authController.restrictTo("Organization"));
// NOTE: The following routes require authentication (Organization must be logged in)
// router.route("/:id").patch(authController.updateOrganization).delete(authController.deleteOrganization);
router.route("/").patch(authController.updateEntity("Organization"));
router.route("/update-password").post(authController.updatePassword("Organization"));

module.exports = router;

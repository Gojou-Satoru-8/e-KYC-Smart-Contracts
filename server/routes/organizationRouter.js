const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(authController.signup("Organization"));
router.route("/login").post(authController.organizationLogin);
router.route("/generate-token").post(authController.mailPasswordResetToken("Organization"));
router.route("/reset-password").post(authController.resetPassword("Organization"));

router.use(authController.checkAuth);
router.route("/logout").get(authController.logout("Organization"));
// NOTE: The following routes require authentication (Organization must be logged in)
// router.route("/:id").patch(authController.updateOrganization).delete(authController.deleteOrganization);
router.route("/update-password").post(authController.updatePassword("Organization"));

module.exports = router;

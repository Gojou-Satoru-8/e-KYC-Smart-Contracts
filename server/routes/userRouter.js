const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(authController.signup("User"));
router.route("/login").post(authController.userLogin);
router.route("/generate-token").post(authController.mailPasswordResetToken("User"));
router.route("/reset-password").post(authController.resetPassword("User"));

router.use(authController.checkAuth);
// NOTE: The following routes require authentication (User must be logged in)
router.route("/logout").get(authController.logout("User"));
router.route("/").get(authController.getCurrentUser).patch(authController.updateUser);
//   .delete(authController.deleteUser);
router.route("/update-password").post(authController.updatePassword("User"));

module.exports = router;

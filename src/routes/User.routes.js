const express = require("express");
const router = express.Router();
const userController = require("../controllers/User.controller");
const verifyToken = require("../middleware/Auth.middleware.js");

router.post("/signIn", verifyToken, userController.googleSignIn());

module.exports = router;

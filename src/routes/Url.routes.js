const express = require("express");
const router = express.Router();
const limiter = require("../middleware/RateLimiter.middleware");
const userController = require("../controllers/Url.controller");
const verifyUser = require("../middleware/User.middleware");
const verifyToken = require("../middleware/Auth.middleware.js");

router.post(
  "/",
  verifyToken,
  verifyUser,
  limiter,
  userController.urlShortner()
);
router.get("/:alias", verifyToken, verifyUser, userController.getShortenUrl());

module.exports = router;

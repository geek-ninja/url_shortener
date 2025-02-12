const express = require("express");
const router = express.Router();
const verifyUser = require("../middleware/User.middleware");
const verifyToken = require("../middleware/Auth.middleware.js");
const analyticsController = require("../controllers/Analytics.controller.js");

router.get(
  "/:alias",
  verifyToken,
  verifyUser,
  analyticsController.getAnalytics()
);
router.get(
  "/topic/:topic",
  verifyToken,
  verifyUser,
  analyticsController.getTopicAnalytics()
);
router.get(
  "/overall/url",
  verifyToken,
  verifyUser,
  analyticsController.getOverallAnalytics()
);

module.exports = router;

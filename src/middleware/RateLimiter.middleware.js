const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 10 * 1000,
  max: 3,
  message: "Too many requests from this IP. Please try again later.",
  legacyHeaders: false,
});

module.exports = limiter;

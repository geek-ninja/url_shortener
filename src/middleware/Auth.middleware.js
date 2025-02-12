const admin = require("../config/FirebaseAdmin.config");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    const decodedTokenUser = await admin.auth().verifyIdToken(token);
    req.user = decodedTokenUser;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyToken;

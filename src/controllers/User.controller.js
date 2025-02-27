const userModel = require("../models/UserModel.model");

module.exports.googleSignIn = () => {
  return async (req, res) => {
    try {
      // Check if user already exists , then just log in.
      const userExists = await userModel.findOne({ email: req.user.email });
      if (userExists) {
        return res.status(200).json({ message: "user logged in successfully" });
      }
      // Save user
      const user = {
        googleId: req.user.user_id,
        email: req.user.email,
        name: req.user.name,
        profilePicture: req.user.picture,
      };
      const newUser = new userModel(user);
      await newUser.save();
      res
        .status(201)
        .json({ data: newUser, message: "user registered successfully" });
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  };
};

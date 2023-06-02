const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");

const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    const userId = decodedToken?.userId;

    let roles = [];

    const user = await User.findById(userId);

    const roleId = user?.roles;

    try {
      const role = await Role.findById(roleId);
      roles = [...roles, role?.name];
    } catch (err) {
      console.log(err);
    }

    let userData = {
      _id: user?._id,
      username: user?.username,
      email: user?.email,
      roles: roles,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports = {
  getUserProfile,
};

const jwt = require("jsonwebtoken");

const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWTSECRET);

    let extractedData = {
      id: decodedToken?.id,
      username: decodedToken?.username,
      email: decodedToken?.email,
      roles: decodedToken?.roles.map((role) => role.name),
    };

    res.status(200).json({
      success: true,
      data: extractedData,
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

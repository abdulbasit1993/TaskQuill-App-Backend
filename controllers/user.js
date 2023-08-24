require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const Aws = require("aws-sdk");

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
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
      address: user?.address,
      occupation: user?.occupation,
      aboutMe: user?.aboutMe,
      profileImage: user?.profileImage,
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

const updateUserProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  const userId = decodedToken?.userId;

  let { username, firstName, lastName, phone, address, occupation, aboutMe } =
    req.body;

  // function checkEmptyFields(obj) {
  //   return Object.values(obj).every(
  //     (value) => value === undefined || value === null || value === ""
  //   );
  // }

  let updatedUser = {
    username: username,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    address: address,
    occupation: occupation,
    aboutMe: aboutMe,
  };

  // if (checkEmptyFields(updatedUser)) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "All fields are empty",
  //   });
  // }

  try {
    await User.findByIdAndUpdate(userId, updatedUser, { new: true })
      .then((user) => {
        res.status(200).json({
          success: true,
          message: "User Profile Updated Successfully",
          data: user,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          success: false,
          message: error,
        });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
});

const uploadProfileImage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    const userId = decodedToken?.userId;

    const user = await User.findById(userId);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: "public-read-write",
      ContentType: "image/jpeg",
    };

    s3.upload(params, (error, data) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: error,
        });
      }

      console.log("uploaded image response from AWS: ", data);

      user.profileImage = data.Location;

      let userData = {
        _id: user?._id,
        username: user?.username,
        profileImage: user?.profileImage,
      };

      user
        .save()
        .then((resData) => {
          res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            data: userData,
          });
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            message: error,
          });
        });
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
  updateUserProfile,
  uploadProfileImage,
};

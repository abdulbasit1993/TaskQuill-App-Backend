const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { authJwt } = require("../middlewares");
const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: filefilter });

router.get(
  "/users/profile",
  [authJwt.verifyToken],
  userController.getUserProfile
);

router.put(
  "/users/update",
  [authJwt.verifyToken],
  userController.updateUserProfile
);

router.put(
  "/users/upload-image",
  [authJwt.verifyToken],
  upload.single("profileImage"),
  userController.uploadProfileImage
);

module.exports = router;

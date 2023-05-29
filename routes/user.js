const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { authJwt } = require("../middlewares");

router.get(
  "/users/profile",
  [authJwt.verifyToken],
  userController.getUserProfile
);

module.exports = router;

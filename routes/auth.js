const express = require('express');
const authController = require('../controllers/auth');
const {verifySignup} = require('../middlewares');
const router = express.Router();

router.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Origin, Content-Type, Accept"
    );
    next();
});

router.post("/auth/register", [verifySignup.checkDuplicateUsernameOrEmail, verifySignup.checkRolesExisted], authController.signup);

router.post("/auth/login", authController.signin);

module.exports = router;
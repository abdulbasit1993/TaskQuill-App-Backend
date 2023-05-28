const Role = require('../models/role');

const User = require('../models/user');

const ROLES = ["user", "admin"];

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        username: req.body.username
    })
    .then((user) => {
        if (user) {
            res.status(400).json({
                success: false,
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            email: req.body.email
        })
        .then((user) => {
            if (user) {
                res.status(400).json({
                    success: false,
                    message: "Failed! Email is already in use!"
                });
                return;
            }
            next();
        })
        .catch((err) => {
            res.status(500).json(
                {
                    success: false,
                    message: err
                })
        })
    })
    .catch((err) => {
        res.status(500).json(
            {
                success: false,
                message: err
            });
    });
};

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).json({
                    success: false,
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });
                return;
            }
        }
    }

    next();
}

const verifySignup = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

module.exports =  verifySignup;
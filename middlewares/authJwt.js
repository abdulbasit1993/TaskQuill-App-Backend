require('dotenv').config();

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');

verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "No token provided"
        })
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length)
    }

    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        req.userId = decoded.id;
        next();
    });
}

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec()
    .then((user) => {
        Role.find({_id: { $in: user.roles }}).exec()
        .then((roles) => {
            for (let i = 0; roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            res.status(403).json({
                success: false,
                message: "Requires Admin Role"
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err
            });
        })
    })
    .catch((err) => {
        res.status(500).json({
            success: false,
            message: err
        });
    })
}

const authJwt = {
    verifyToken,
    isAdmin
};

module.exports = authJwt;
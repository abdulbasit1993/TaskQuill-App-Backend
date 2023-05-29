require('dotenv').config();

const User = require('../models/user');
const Role = require('../models/role');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

function signup(req, res) {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save()
    .then((user) => {
        if (req.body.roles) {
            Role.find({ name: { $in: req.body.roles }})
            .then((roles) => {
                user.roles = roles.map((role) => role._id);
                user.save()
                .then(() => {
                    res.status(201).json(
                        {
                            success: true,
                            message: "User was registered successfully"
                        })
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
                    })
            })
        } else {
            Role.findOne({ name: "user" })
            .then((role) => {
                user.roles = [role._id];
                user.save()
                .then(() => {
                    res.status(201).json(
                        {
                            success: true,
                            message: "User was registered successfully"
                        })
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
                    })
            })
        }
    })
    .catch((err) => {
        res.status(500).json(
            {
                success: false,
                message: err
            })
    })
}

function signin(req, res) {
    User.findOne({
        email: req.body.email
    })
    .populate("roles", "-__v")
    .exec()
    .then(user => {
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password",
                token: null
            });
        }

        var token = jwt.sign({id: user.id, username: user.username, email: user.email}, process.env.JWTSECRET, {
            expiresIn: 86400 
            // token expires in 24 hours
        });

        var authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
            authorities.push(user.roles[i].name)
        }

        res.status(200).json({
            success: true,
            message: "User login successful",
            token: token,
            roles: authorities
        })
    })
    .catch(err => {
        res.status(500).json(
            {
                success: false,
                message: err
            })
    })
}

module.exports = {
    signup,
    signin
}
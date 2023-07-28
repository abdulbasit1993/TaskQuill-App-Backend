require("dotenv").config();

const User = require("../models/user");
const Role = require("../models/role");
const OTP = require("../models/otpCode");
const nodemailer = require("nodemailer");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

function signup(req, res) {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address,
    occupation: req.body.occupation,
    aboutMe: req.body.aboutMe,
  });

  user
    .save()
    .then((user) => {
      if (req.body.roles) {
        Role.find({ name: { $in: req.body.roles } })
          .then((roles) => {
            user.roles = roles.map((role) => role._id);
            user
              .save()
              .then(() => {
                res.status(201).json({
                  success: true,
                  message: "User was registered successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  success: false,
                  message: err,
                });
              });
          })
          .catch((err) => {
            res.status(500).json({
              success: false,
              message: err,
            });
          });
      } else {
        Role.findOne({ name: "user" })
          .then((role) => {
            user.roles = [role._id];
            user
              .save()
              .then(() => {
                res.status(201).json({
                  success: true,
                  message: "User was registered successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  success: false,
                  message: err,
                });
              });
          })
          .catch((err) => {
            res.status(500).json({
              success: false,
              message: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
}

function signin(req, res) {
  User.findOne({
    email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User Not Found",
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid Password",
          token: null,
        });
      }

      var token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWTSECRET,
        {
          expiresIn: 86400,
          // token expires in 24 hours
        }
      );

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push(user.roles[i].name);
      }

      res.status(200).json({
        success: true,
        message: "User login successful",
        token: token,
        roles: authorities,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
}

async function forgetPassword(req, res) {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const otp = await OTP.create({
      code: otpCode,
      email: email,
    });

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "taskquill.support@gmail.com",
      to: email,
      subject: "OTP Code Verification for Reset Password - TaskQuill",
      text: `Your OTP Code for password reset is ${otpCode}. This code will expire in 15 minutes. Use this code in the app to reset the password.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error while sending OTP: ", error);
        return res.status(500).json({
          success: false,
          message: "An error occured while sending OTP",
        });
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({
          success: true,
          message: "OTP code sent successfully",
        });
      }
    });
  } catch (error) {
    console.log("Error while sending OTP: ", error);
    res.status(500).json({
      success: false,
      message: "An error occured while sending OTP",
    });
  }
}

async function resetPassword(req, res) {
  const { email, otpCode, newPassword } = req.body;

  try {
    const otp = await OTP.findOne({ email, code: otpCode });

    if (!otp) {
      res.status(404).json({
        success: false,
        message: "Invalid OTP code or OTP code has expired",
      });
    }

    if (otp.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        message: "OTP code has expired",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    existingUser.password = hashedPassword;
    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occured while verifying OTP and resetting password",
    });
  }
}

module.exports = {
  signup,
  signin,
  forgetPassword,
  resetPassword,
};

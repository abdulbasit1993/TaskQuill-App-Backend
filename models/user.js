const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    occupation: {
      type: String,
    },
    aboutMe: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

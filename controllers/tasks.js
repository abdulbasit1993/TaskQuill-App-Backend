require("dotenv").config();

const Task = require("../models/task");
const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const addTask = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  const userId = decodedToken?.userId;
  let userObj = {};

  let { title, description, date, time } = req.body;

  title = title.trim();
  description = description.trim();

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Please enter title for the task",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  await User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      userObj.username = user.username;
      userObj._id = user._id;
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });

  const newTask = new Task({
    title: title,
    description: description,
    date: date,
    time: time,
    user: userObj,
  });

  await newTask
    .save()
    .then((task) => {
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
};

const getTasks = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  const userId = decodedToken.userId;

  await Task.find({ "user._id": userId })
    .then((task) => {
      res.status(200).json({
        success: true,
        data: task,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
};

const updateTask = async (req, res) => {
  const id = req.params.id;

  let { title, description, date, time, status } = req.body;
  let userObj = {};

  title = title.trim();
  description = description.trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  // Validate status against enum values
  if (!["Pending", "Completed"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  await User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      userObj.username = user.username;
      userObj._id = user._id;
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });

  let updatedTask = {
    title: title,
    description: description,
    date: date,
    time: time,
    status: status,
    user: userObj,
  };

  await Task.findByIdAndUpdate(id, updatedTask)
    .then((task) => {
      res.status(200).json({
        success: true,
        message: "Task Updated Successfully",
        data: updatedTask,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
};

const deleteTask = async (req, res) => {
  const id = req.params.id;

  await Task.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Todo Deleted Successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err,
      });
    });
};

module.exports = {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
};

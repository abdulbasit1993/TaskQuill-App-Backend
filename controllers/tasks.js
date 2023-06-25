require("dotenv").config();

const Task = require("../models/task");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const addTask = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  const userId = decodedToken?.userId;

  let { title, description, dueDate } = req.body;

  title = title.trim();
  description = description.trim();

  if (!title && !description) {
    return res.status(400).json({
      success: false,
      message: "Please enter title and description for the task",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const newTask = new Task({
    title: title,
    description: description,
    dueDate: dueDate,
    userId: userId,
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

  await Task.find({ userId: userId })
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

  let { title, description, dueDate } = req.body;

  title = title.trim();
  description = description.trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  await Task.findByIdAndUpdate(id, {
    title: title,
    description: description,
    dueDate: dueDate,
  })
    .then((task) => {
      res.status(200).json({
        success: true,
        message: "Task Updated Successfully",
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

const toggleCompleteTask = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  await Task.findById(id)
    .then((task) => {
      task.status = task.status === "incomplete" ? "completed" : "incomplete";

      task
        .save()
        .then((data) => {
          res.status(200).json({
            success: true,
            message: "Task Updated Successfully",
            data: data,
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
      res.status(404).json({
        success: false,
        message: "Task not found",
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
  toggleCompleteTask,
  deleteTask,
};

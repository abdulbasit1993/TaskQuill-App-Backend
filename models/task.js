const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  _id: mongoose.Schema.Types.ObjectId,
});

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Expired"],
      default: "Pending",
    },
    user: userSchema,
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;

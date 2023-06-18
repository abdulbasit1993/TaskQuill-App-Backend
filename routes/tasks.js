const express = require("express");
const { authJwt } = require("../middlewares");
const taskController = require("../controllers/tasks");
const router = express.Router();

router.post("/tasks/add", [authJwt.verifyToken], taskController.addTask);

router.get("/tasks/getAll", [authJwt.verifyToken], taskController.getTasks);

router.delete(
  "/tasks/delete/:id",
  [authJwt.verifyToken],
  taskController.deleteTask
);

module.exports = router;

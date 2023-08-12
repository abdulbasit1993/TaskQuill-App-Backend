require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const schedule = require("node-schedule");
const Task = require("./models/task");

const cors = require("cors");

let corsOptions = {
  origin: "*",
};

const app = express();

app.use(cors(corsOptions));

const authRoutes = require("./routes/auth");

const taskRoutes = require("./routes/tasks");

const userRoutes = require("./routes/user");

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const Role = require("./models/role");

const PORT = process.env.PORT || 3000;

app.use("/api", authRoutes);

app.use("/api", taskRoutes);

app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

function initial() {
  Role.estimatedDocumentCount().then((count) => {
    if (count === 0) {
      new Role({
        name: "user",
      })
        .save()
        .then(() => {
          console.log("Added 'user' to roles collection");
        })
        .catch((err) => {
          if (err) {
            console.log("error", err);
          }
        });

      new Role({
        name: "admin",
      })
        .save()
        .then(() => {
          console.log("Added 'admin' to roles collection");
        })
        .catch((err) => {
          if (err) {
            console.log("error", err);
          }
        });
    }
  });
}

const updateExpiredTasks = async () => {
  try {
    const currentTime = new Date();

    const tasks = await Task.find({ status: "Pending" });

    tasks.forEach(async (task) => {
      const taskTimeParts = task.time.split(":");
      const taskHour = parseInt(taskTimeParts[0]);
      const taskMinute = parseInt(taskTimeParts[1]);

      const taskDateTime = new Date(task.date);
      taskDateTime.setHours(taskHour, taskMinute, 0, 0);

      if (currentTime >= taskDateTime) {
        task.status = "Expired";
        await task.save();
        console.log(`Task ${task.title} has been marked as Expired.`);
      }
    });
  } catch (error) {
    console.log("Error updating expired tasks: ", error);
  }
};

const scheduledTask = schedule.scheduleJob("* * * * *", updateExpiredTasks);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to Database");
      initial();
    })
    .catch((error) => {
      console.log(error);
      process.exit();
    });
});

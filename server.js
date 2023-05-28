require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const authRoutes = require('./routes/auth')

const cors = require("cors");

let corsOptions = {
    origin: "*"
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

const Role = require('./models/role');

const PORT = process.env.PORT || 3000;

app.use("/api", authRoutes);

app.get('/', (req, res) => {
res.send("Server is working!")
})

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to Database');
    initial();
})
.catch(error => {
    console.log(error);
    process.exit()
})

function initial() {
Role.estimatedDocumentCount()
.then((count) => {
    if (count === 0) {
        new Role({
            name: "user"
        })
        .save()
        .then(() => {
            console.log("Added 'user' to roles collection");
        })
        .catch((err) => {
            if (err) {
                console.log("error", err)
            } 
        });

        new Role({
            name: "admin"
        })
        .save()
        .then(() => {
            console.log("Added 'admin' to roles collection");
        })
        .catch((err) => {
            if (err) {
                console.log("error", err)
            } 
        })
    }
})
}

app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})
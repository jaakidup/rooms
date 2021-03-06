const express = require('express');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const usersRoute = require("./routes/users");
const roomsRoute = require("./routes/rooms");

dotenv.config();

mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true },
    () => console.log("Connected to DB")
);


app.use(morgan("tiny"))
app.use(helmet())
app.use(express.json())
app.use("/api/users", usersRoute)
app.use("/api/rooms", roomsRoute)



app.listen(3000, () => console.log('App running on 3000'));


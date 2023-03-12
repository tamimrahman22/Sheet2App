var express = require('express');
const mongoose = require("mongoose");

var app = express();

app.use(express.json());
mongoose.connect('mongodb://localhost:27017/s2a',
  {
    useNewUrlParser: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
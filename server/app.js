var express = require('express');
const mongoose = require("mongoose");
var appRouter = require("./routes/apps")
var dataSourceRouter = require("./routes/dataSource")
var viewsRouter = require("./routes/views")
var cors = require('cors');

var app = express();

app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}))
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

app.listen(4000, function() {
	console.log('Server Started...');
});

app.use('/app', appRouter);
app.use('/datasource', dataSourceRouter);
app.use('/views', viewsRouter);
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./route");
const multer= require("multer");
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use( multer().any())
mongoose
  .connect(
    "mongodb+srv://vikram2211:niI4v8Tkxl2drjiN@cluster0.iufwb.mongodb.net/group-8-Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("MongoDB Connected.");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", route);

app.listen(process.env.PORT || 3000, () => {
  console.log("Express running on PORT: " + (process.env.PORT || 3000));
});


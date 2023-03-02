const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);
app.set("view engine", "ejs");
fs.mkdir(__dirname + "/temp/", (err) => {});

// config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// 1. manage get form data
app.get("/getformdata", (req, res) => {
  console.log(req.query);
  res.send(req.query);
});

// 2. manage post form data
app.post("/postformdata", async (req, res) => {
  // code for sigle file upload
  let imageData = req.files.filedata;
  if (!Array.isArray(imageData)) {
    let filedata = req.files.filedata;
    let result = await cloudinary.v2.uploader.upload(filedata.tempFilePath, {
      folder: "users",
    });
    return res.json(result);
  }

  // code for uploading multiple form
  if (Array.isArray(imageData)) {
    let imageArray = [];
    let result = [];
    if (req.files) {
      for (var i = 0; i < req.files.filedata.length; i++) {
        result.push(
          cloudinary.v2.uploader.upload(req.files.filedata[i].tempFilePath, {
            folder: "users",
          })
        );
      }

      let finalOutput = await Promise.all(result);

      for (let index = 0; index < finalOutput.length; index++) {
        imageArray.push({
          secure_url: finalOutput[index].secure_url,
          public_id: finalOutput[index].public_id,
        });
      }
    }

    // console.log(result);
    let details = {
      email: req.body.email,
      password: req.body.password,
      imageArray,
    };
    return res.send(details);
  }
});

//1. render get form
app.get("/getform", (req, res) => {
  res.render("getdata");
});

// render post form
app.get("/postform", (req, res) => {
  res.render("postdata");
});

app.listen(process.env.PORT, console.log("server is running on port 4000"));

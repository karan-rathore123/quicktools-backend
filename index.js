const fs = require("fs");
require("dotenv").config();

const path = require("path");
const ILovePDFApi = require("@ilovepdf/ilovepdf-nodejs");
const ILovePDFFile = require("@ilovepdf/ilovepdf-nodejs/ILovePDFFile");

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const instance = new ILovePDFApi(
  process.env.PUBLIC_KEY,
  process.env.SECRET_KEY
);

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("QuickTools Backend Running");
});

app.get("/test-keys", (req, res) => {
  res.json({
    publicKeyExists: !!process.env.PUBLIC_KEY,
    secretKeyExists: !!process.env.SECRET_KEY,
  });
});

app.post("/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
  });
});

app.post("/compress", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const task = instance.newTask("compress");

    await task.start();

    const file = new ILovePDFFile(req.file.path);

    await task.addFile(file);

    await task.process();

    const data = await task.download();

    res.json({
      success: true,
      message: "PDF compressed successfully",
      size: data.length,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
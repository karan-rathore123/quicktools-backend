const fs = require("fs");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
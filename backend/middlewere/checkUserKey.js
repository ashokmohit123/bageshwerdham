// middlewere/checkUserKey.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure uploads folder exists
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// ✅ API Key checker middleware
export function checkApiKey(req, res, next) {
  const apiKey = req.headers["apikey"];
  if (!apiKey || apiKey !== "12345") {
    return res.status(401).json({ message: "Invalid or missing API key" });
  }
  next();
}

// make sure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

// ✅ FIXED FILE FILTER

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "audio/mpeg", "audio/mp3"];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("❌ Only image and video files are allowed!"));
  }

  cb(null, true);
};




// function fileFilter(req, file, cb) {
//   console.log("Uploading:", file.originalname, "=>", file.mimetype);

//   if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("❌ Only image and video files are allowed!"));
//   }
// }


export const upload = multer({ storage, fileFilter });

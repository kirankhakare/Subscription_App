const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Check if environment variables are present
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    "Cloudinary config missing! Please set CLOUD_NAME, API_KEY, and API_SECRET in your .env file."
  );
}

// Cloudinary config
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// File filter to validate file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(file.originalname.toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed"));
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
});

// Error handler for multer
const uploadMiddleware = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res.status(400).json({ message: err.message });
      } else if (err) {
        // Unknown errors
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

module.exports = upload;

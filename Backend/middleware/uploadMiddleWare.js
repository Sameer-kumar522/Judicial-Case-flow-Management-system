const multer = require('multer');
const path = require('path');

// Store uploaded files in memory instead of local disk
const storage = multer.memoryStorage();

// Allowed file formats
const allowedExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, JPG and PNG files are allowed.'));
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (customPath = 'uploads/') => {
  // Ensure the directory exists
  fs.mkdirSync(customPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, customPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only .jpeg, .jpg, .png images are allowed'));
      }
    }
  });
};

module.exports = createUploader;

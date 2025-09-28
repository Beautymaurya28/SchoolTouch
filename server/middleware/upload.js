const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to create storage folder dynamically if it doesn't exist
const makeDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Dynamic storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/others'; // default

    // Homework uploads
    if (req.baseUrl.includes('homework')) {
      if (req.originalUrl.includes('submit')) {
        uploadPath = 'uploads/homework/submissions';
      } else {
        uploadPath = 'uploads/homework/attachments';
      }
    }

    // Study material uploads
    else if (req.baseUrl.includes('material')) {
      uploadPath = 'uploads/studymaterial';
    }

    // UPI QR uploads
    else if (req.baseUrl.includes('fees') && req.originalUrl.includes('upi-qr-image')) {
      uploadPath = 'uploads/upi';
    }

    // ANNOUNCEMENTS uploads
    else if (req.baseUrl.includes('announcements')) {
      uploadPath = 'uploads/announcements';
    }

    makeDir(uploadPath); // ensure folder exists
    cb(null, uploadPath);
  },

  
  filename: (req, file, cb) => {
    // For UPI QR upload, use fixed name
    if (req.baseUrl.includes('fees') && req.originalUrl.includes('upi-qr-image')) {
      cb(null, 'upi-qr' + path.extname(file.originalname));
    } else {
      cb(
        file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      );
    }
  },
});

// File filter (allow only pdf, docx, images, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|jpg|jpeg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only documents and images are allowed.'));
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;

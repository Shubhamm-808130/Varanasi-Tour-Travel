const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed extensions and MIME types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Security Error: Only .jpg, .jpeg, .png, and .webp image files are allowed.'));
  }
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Security Error: Invalid file MIME type detected. Upload rejected.'));
  }
  cb(null, true);
};

// Store uploaded file in memory first so sharp can resize & compress to WebP before saving
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Accept up to 10 MB raw photo, compressed down to ~80-150 KB WebP
  },
  fileFilter: fileFilter
});

/** Compress a single multer memory file to max 1200px WebP and persist to uploads/. */
const compressAndSaveToWebp = async (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const webpFilename = `vt-${uniqueSuffix}.webp`;
  const outputPath = path.join(uploadDir, webpFilename);

  await sharp(file.buffer)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  file.filename = webpFilename;
  file.path = outputPath;
  file.mimetype = 'image/webp';
};

/** Express middleware to automatically optimize req.file / req.files to lightweight WebP. */
const optimizeImages = async (req, res, next) => {
  try {
    const tasks = [];
    if (req.file && req.file.buffer) {
      tasks.push(compressAndSaveToWebp(req.file));
    }
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(f => {
          if (f.buffer) tasks.push(compressAndSaveToWebp(f));
        });
      } else {
        Object.values(req.files).forEach(fileArr => {
          if (Array.isArray(fileArr)) {
            fileArr.forEach(f => {
              if (f.buffer) tasks.push(compressAndSaveToWebp(f));
            });
          }
        });
      }
    }
    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
    next();
  } catch (err) {
    next(err);
  }
};

upload.optimizeImages = optimizeImages;

module.exports = upload;

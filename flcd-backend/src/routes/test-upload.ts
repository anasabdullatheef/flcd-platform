import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Simple local file upload for testing
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/test'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const testUpload = multer({ 
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Test upload endpoint
router.post('/test-upload', testUpload.single('testFile'), (req, res) => {
  try {
    console.log('Test upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
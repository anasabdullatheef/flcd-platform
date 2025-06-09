import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  signatureVersion: 'v4'
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration (then upload to S3)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const s3Upload = multer({
  storage: localStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    console.log('File filter called for file:', file.originalname);
    // Allow common document types
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExt)) {
      console.log('File type approved:', fileExt);
      cb(null, true);
    } else {
      console.log('File type rejected:', fileExt);
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

// Function to upload file to S3
export const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'flcd-documents',
      Key: key,
      Body: fileContent,
      ACL: 'private',
      ServerSideEncryption: 'AES256'
    };

    console.log('Uploading to S3 with params:', { bucket: params.Bucket, key: params.Key });
    const result = await s3.upload(params).promise();
    console.log('S3 upload successful:', result.Location);
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

// Function to delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET || 'flcd-documents',
      Key: key
    }).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Function to generate signed URL for file access
export const generateSignedUrl = (key: string, expiresIn: number = 3600): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET || 'flcd-documents',
    Key: key,
    Expires: expiresIn
  });
};

export { s3 };
import express from 'express';
import { PrismaClient, DocumentType, DocumentStatus } from '@prisma/client';
import { s3Upload, uploadToS3, deleteFromS3, generateSignedUrl } from '../config/s3';

const router = express.Router();
const prisma = new PrismaClient();

// Upload multiple documents for a rider
router.post('/riders/:riderId/documents', (req, res, next) => {
  console.log('=== DOCUMENT UPLOAD MIDDLEWARE STARTED ===');
  console.log('Request headers:', req.headers);
  console.log('Request params:', req.params);
  console.log('Request method:', req.method);
  next();
}, s3Upload.fields([
  { name: 'passport', maxCount: 1 },
  { name: 'emiratesId', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'workPermit', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    const { riderId } = req.params;
    
    console.log('Document upload request received for rider:', riderId);
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    
    const files = req.files as { [fieldname: string]: any[] };

    // Verify rider exists
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    });

    if (!rider) {
      console.log('Rider not found:', riderId);
      return res.status(404).json({ error: 'Rider not found' });
    }

    if (!files || Object.keys(files).length === 0) {
      console.log('No files received in the request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedDocuments = [];

    // Process each file type
    for (const [fieldName, fileArray] of Object.entries(files)) {
      for (const file of fileArray) {
        let documentType: DocumentType;
        
        // Map field names to document types
        switch (fieldName) {
          case 'passport':
            documentType = DocumentType.PASSPORT;
            break;
          case 'emiratesId':
            documentType = DocumentType.EMIRATES_ID;
            break;
          case 'license':
            documentType = DocumentType.DRIVING_LICENSE;
            break;
          case 'workPermit':
            documentType = DocumentType.WORK_PERMIT;
            break;
          case 'insurance':
            documentType = DocumentType.INSURANCE;
            break;
          case 'profilePicture':
            documentType = DocumentType.PROFILE_PHOTO;
            break;
          default:
            documentType = DocumentType.OTHER_DOCUMENT;
        }

        // For now, just store file locally and save to database
        console.log('Processing file:', { 
          localPath: file.path, 
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });

        // Save document record to database
        const document = await prisma.riderDocument.create({
          data: {
            riderId: riderId,
            type: documentType,
            fileName: file.originalname,
            filePath: file.path, // Local file path for now
            fileSize: file.size,
            mimeType: file.mimetype,
            status: DocumentStatus.PENDING
          }
        });

        uploadedDocuments.push({
          id: document.id,
          type: documentType,
          fileName: file.originalname,
          fileUrl: `http://localhost:3000/uploads/temp/${file.filename}`,
          uploadedAt: document.uploadedAt
        });
      }
    }

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocuments
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all documents for a rider
router.get('/riders/:riderId/documents', async (req, res) => {
  try {
    const { riderId } = req.params;

    const documents = await prisma.riderDocument.findMany({
      where: { riderId },
      orderBy: { uploadedAt: 'desc' }
    });

    // For local files, use direct URL, for S3 use signed URLs
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      fileUrl: doc.filePath.startsWith('http') ? doc.filePath : 
               doc.filePath.includes('riders/') ? generateSignedUrl(doc.filePath, 3600) :
               `http://localhost:3000/uploads/temp/${doc.filePath.split('/').pop()}`
    }));

    res.json({ documents: documentsWithUrls });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a document
router.delete('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.riderDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from S3
    await deleteFromS3(document.filePath);

    // Delete from database
    await prisma.riderDocument.delete({
      where: { id: documentId }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document status (for verification)
router.put('/documents/:documentId/status', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, verifiedAt } = req.body;

    const document = await prisma.riderDocument.update({
      where: { id: documentId },
      data: {
        status,
        verifiedAt: status === DocumentStatus.VERIFIED ? new Date() : null
      }
    });

    res.json({
      message: 'Document status updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test S3 connectivity
router.get('/test-s3', async (req, res) => {
  try {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();
    
    // Test S3 connection by listing buckets
    const result = await s3.listBuckets().promise();
    console.log('S3 connection test successful:', result);
    
    res.json({ 
      message: 'S3 connection successful', 
      buckets: result.Buckets?.map((b: any) => b.Name) || [],
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET
    });
  } catch (error: any) {
    console.error('S3 connection test failed:', error);
    res.status(500).json({ 
      error: 'S3 connection failed', 
      details: error.message,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET
    });
  }
});

export default router;
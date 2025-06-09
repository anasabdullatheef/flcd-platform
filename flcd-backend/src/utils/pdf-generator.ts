import puppeteer from 'puppeteer';
import { uploadToS3 } from '../config/s3';
import { visaAcknowledgement } from './pdf-templates/visa-acknowledgement';
import { simReceiptModel } from './pdf-templates/sim-acknowledgement';

const PDF_HEADER = `
<div style="font-size: 10px; padding: 10px; text-align: center; width: 100%;">
  <h2 style="margin: 0; color: #333;">FLC Delivery Services</h2>
</div>
`;

const PDF_FOOTER = `
<div style="font-size: 8px; padding: 10px; text-align: center; width: 100%;">
  <span class="pageNumber"></span> / <span class="totalPages"></span>
</div>
`;

export const generateVisaAcknowledgement = async ({
  type,
  date,
  time,
  riderName,
  signatureImage,
  nationality,
  idNumber,
  admin,
}: any): Promise<{
  key: string;
  fileName: string;
  fileType: string;
  localPath?: string;
}> => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    const htmlContent = await visaAcknowledgement({
      type,
      date,
      time,
      riderName,
      signatureImage,
      nationality,
      idNumber,
      admin,
    });

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      scale: 0.7,
      margin: {
        top: '120px',
        bottom: '50px',
      },
      displayHeaderFooter: true,
      headerTemplate: PDF_HEADER,
      footerTemplate: PDF_FOOTER,
      printBackground: true,
    });

    await browser.close();

    const fileName = `visa-acknowledgement-${idNumber}-${Date.now()}.pdf`;
    const s3Key = `acknowledgements/visa/${fileName}`;

    try {
      // Try to upload to S3
      await uploadToS3Buffer(Buffer.from(pdfBuffer), s3Key);
      return { key: s3Key, fileName, fileType: 'application/pdf' };
    } catch (s3Error) {
      // If S3 fails, save locally
      console.warn('S3 upload failed, saving locally:', s3Error);
      const fs = require('fs');
      const path = require('path');
      const localDir = path.join(__dirname, '../../uploads/acknowledgements');
      
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      const localPath = path.join(localDir, fileName);
      fs.writeFileSync(localPath, Buffer.from(pdfBuffer));
      
      return { 
        key: `uploads/acknowledgements/${fileName}`, 
        fileName, 
        fileType: 'application/pdf',
        localPath
      };
    }
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error generating visa acknowledgement:', error);
    throw error;
  }
};

export const generateSimAcknowledgement = async ({
  type,
  date,
  riderName,
  signatureImage,
  nationality,
  idNumber,
  admin,
  phone,
}: any): Promise<{
  key: string;
  fileName: string;
  fileType: string;
  localPath?: string;
}> => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    const htmlContent = await simReceiptModel({
      type,
      date,
      riderName,
      signatureImage,
      nationality,
      idNumber,
      admin,
      phone,
    });

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      scale: 0.7,
      margin: {
        top: '120px',
        bottom: '50px',
      },
      displayHeaderFooter: true,
      headerTemplate: PDF_HEADER,
      footerTemplate: PDF_FOOTER,
      printBackground: true,
    });

    await browser.close();

    const fileName = `sim-acknowledgement-${idNumber}-${Date.now()}.pdf`;
    const s3Key = `acknowledgements/sim/${fileName}`;

    try {
      // Try to upload to S3
      await uploadToS3Buffer(Buffer.from(pdfBuffer), s3Key);
      return { key: s3Key, fileName, fileType: 'application/pdf' };
    } catch (s3Error) {
      // If S3 fails, save locally
      console.warn('S3 upload failed, saving locally:', s3Error);
      const fs = require('fs');
      const path = require('path');
      const localDir = path.join(__dirname, '../../uploads/acknowledgements');
      
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      const localPath = path.join(localDir, fileName);
      fs.writeFileSync(localPath, Buffer.from(pdfBuffer));
      
      return { 
        key: `uploads/acknowledgements/${fileName}`, 
        fileName, 
        fileType: 'application/pdf',
        localPath
      };
    }
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error generating SIM acknowledgement:', error);
    throw error;
  }
};

// Helper function to upload buffer to S3
const uploadToS3Buffer = async (buffer: Buffer, key: string): Promise<string> => {
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'flcd-documents',
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ACL: 'private',
    ServerSideEncryption: 'AES256'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};
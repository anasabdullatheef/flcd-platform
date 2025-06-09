import express from 'express';
import multer from 'multer';
import { PrismaClient, RiderEmploymentStatus, OnboardingStatus, AcknowledgementType } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { sendRiderCredentials } from '../utils/email';
import { generateVisaAcknowledgement, generateSimAcknowledgement } from '../utils/pdf-generator';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'csvFile') {
      // Allow CSV and Excel files for bulk upload
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExt)) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and Excel files are allowed'));
      }
    } else {
      // Allow common document types for individual documents
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExt)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
  }
});

// Validation schemas
const createRiderSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  
  // Identity & Compliance
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  emiratesId: z.string().optional(),
  emiratesIdExpiry: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  
  // Contact Numbers
  companySim: z.string().optional(),
  emergencyPhone: z.string().optional(),
  
  // Other Info
  languageSpoken: z.string().optional(),
  cityOfWork: z.string().optional(),
  joiningDate: z.string().optional(),
  profilePicture: z.string().optional(),
  bloodGroup: z.string().optional(),
  insurancePartner: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  healthNotes: z.string().optional(),
  adminNotes: z.string().optional(),
  
  // Partner & Employment
  employeeId: z.string().optional(),
  deliveryPartner: z.string().optional(),
  deliveryPartnerId: z.string().optional(),
  
  // Status & Legacy
  employmentStatus: z.nativeEnum(RiderEmploymentStatus).default('PENDING'),
  address: z.string().optional()
});

const updateRiderSchema = z.object({
  // Personal Info
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  
  // Identity & Compliance
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  emiratesId: z.string().optional(),
  emiratesIdExpiry: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  
  // Contact Numbers
  companySim: z.string().optional(),
  emergencyPhone: z.string().optional(),
  
  // Other Info
  languageSpoken: z.string().optional(),
  cityOfWork: z.string().optional(),
  joiningDate: z.string().optional(),
  profilePicture: z.string().optional(),
  bloodGroup: z.string().optional(),
  insurancePartner: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  healthNotes: z.string().optional(),
  adminNotes: z.string().optional(),
  
  // Partner & Employment
  employeeId: z.string().optional(),
  deliveryPartner: z.string().optional(),
  deliveryPartnerId: z.string().optional(),
  
  // Status & Legacy
  employmentStatus: z.nativeEnum(RiderEmploymentStatus).optional(),
  onboardingStatus: z.nativeEnum(OnboardingStatus).optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional()
});

// Generate unique rider code
const generateRiderCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  
  // Get the count of riders created this year
  const count = await prisma.rider.count({
    where: {
      riderCode: {
        startsWith: `FLCR${yearSuffix}`
      }
    }
  });
  
  // Generate new code with zero-padded sequence
  const sequence = (count + 1).toString().padStart(4, '0');
  return `FLCR${yearSuffix}${sequence}`;
};

// Generate random password
const generateRandomPassword = (length: number = 8): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * @swagger
 * /riders:
 *   get:
 *     summary: Get all riders
 *     description: Retrieve riders with pagination, search, and filtering options
 *     tags: [Riders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of riders per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, REJECTED]
 *         description: Filter by onboarding status
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, SUSPENDED, TERMINATED]
 *         description: Filter by employment status
 *       - in: query
 *         name: partnerName
 *         schema:
 *           type: string
 *         description: Filter by partner name
 *     responses:
 *       200:
 *         description: Riders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 riders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rider'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/riders - Get all riders with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const employmentStatus = req.query.employmentStatus as string;
    const partnerName = req.query.partnerName as string;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { riderCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.onboardingStatus = status;
    }
    
    if (employmentStatus) {
      where.employmentStatus = employmentStatus;
    }
    
    if (partnerName) {
      where.partnerName = { contains: partnerName, mode: 'insensitive' };
    }
    
    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          documents: {
            select: {
              id: true,
              type: true,
              status: true
            }
          },
          _count: {
            select: {
              acknowledgments: true,
              vehicleAssignments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.rider.count({ where })
    ]);
    
    res.json({
      riders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /riders:
 *   post:
 *     summary: Create new rider
 *     description: Create a new rider with personal and employment information
 *     tags: [Riders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRiderRequest'
 *     responses:
 *       201:
 *         description: Rider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rider:
 *                   $ref: '#/components/schemas/Rider'
 *       400:
 *         description: Validation error or rider already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/riders - Create new rider
router.post('/', async (req, res) => {
  try {
    const riderData = createRiderSchema.parse(req.body);
    
    // Check for unique constraints
    const existingRider = await prisma.rider.findFirst({
      where: {
        OR: [
          { phone: riderData.phone },
          ...(riderData.email && riderData.email.trim() ? [{ email: riderData.email }] : []),
          ...(riderData.emiratesId && riderData.emiratesId.trim() ? [{ emiratesId: riderData.emiratesId }] : []),
          ...(riderData.passportNumber && riderData.passportNumber.trim() ? [{ passportNumber: riderData.passportNumber }] : []),
          ...(riderData.licenseNumber && riderData.licenseNumber.trim() ? [{ licenseNumber: riderData.licenseNumber }] : []),
          ...(riderData.employeeId && riderData.employeeId.trim() ? [{ employeeId: riderData.employeeId }] : [])
        ]
      }
    });
    
    if (existingRider) {
      return res.status(409).json({ error: 'Rider with this phone, email, Emirates ID, passport, or license already exists' });
    }
    
    // Generate unique rider code and password
    const riderCode = await generateRiderCode();
    const generatedPassword = generateRandomPassword();
    
    // Get or create a default admin user
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@flcd.com' }
    });
    
    if (!defaultUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@flcd.com',
          firstName: 'Admin',
          lastName: 'User',
          password: hashedPassword
        }
      });
    }
    
    const defaultUserId = defaultUser.id;
    
    // Clean data - convert empty strings to null for optional unique fields
    const cleanData = {
      ...riderData,
      email: riderData.email && riderData.email.trim() ? riderData.email.trim() : null,
      emiratesId: riderData.emiratesId && riderData.emiratesId.trim() ? riderData.emiratesId.trim() : null,
      passportNumber: riderData.passportNumber && riderData.passportNumber.trim() ? riderData.passportNumber.trim() : null,
      licenseNumber: riderData.licenseNumber && riderData.licenseNumber.trim() ? riderData.licenseNumber.trim() : null,
      employeeId: riderData.employeeId && riderData.employeeId.trim() ? riderData.employeeId.trim() : null,
      companySim: riderData.companySim && riderData.companySim.trim() ? riderData.companySim.trim() : null,
      emergencyPhone: riderData.emergencyPhone && riderData.emergencyPhone.trim() ? riderData.emergencyPhone.trim() : null,
      nationality: riderData.nationality && riderData.nationality.trim() ? riderData.nationality.trim() : null,
      languageSpoken: riderData.languageSpoken && riderData.languageSpoken.trim() ? riderData.languageSpoken.trim() : null,
      cityOfWork: riderData.cityOfWork && riderData.cityOfWork.trim() ? riderData.cityOfWork.trim() : null,
      bloodGroup: riderData.bloodGroup && riderData.bloodGroup.trim() ? riderData.bloodGroup.trim() : null,
      insurancePartner: riderData.insurancePartner && riderData.insurancePartner.trim() ? riderData.insurancePartner.trim() : null,
      healthNotes: riderData.healthNotes && riderData.healthNotes.trim() ? riderData.healthNotes.trim() : null,
      adminNotes: riderData.adminNotes && riderData.adminNotes.trim() ? riderData.adminNotes.trim() : null,
      deliveryPartner: riderData.deliveryPartner && riderData.deliveryPartner.trim() ? riderData.deliveryPartner.trim() : null,
      deliveryPartnerId: riderData.deliveryPartnerId && riderData.deliveryPartnerId.trim() ? riderData.deliveryPartnerId.trim() : null,
      address: riderData.address && riderData.address.trim() ? riderData.address.trim() : null
    };

    // Create rider
    const rider = await prisma.rider.create({
      data: {
        ...cleanData,
        riderCode,
        dateOfBirth: cleanData.dateOfBirth ? new Date(cleanData.dateOfBirth) : null,
        passportExpiry: cleanData.passportExpiry ? new Date(cleanData.passportExpiry) : null,
        emiratesIdExpiry: cleanData.emiratesIdExpiry ? new Date(cleanData.emiratesIdExpiry) : null,
        licenseExpiry: cleanData.licenseExpiry ? new Date(cleanData.licenseExpiry) : null,
        joiningDate: cleanData.joiningDate ? new Date(cleanData.joiningDate) : null,
        insuranceExpiry: cleanData.insuranceExpiry ? new Date(cleanData.insuranceExpiry) : null,
        createdById: defaultUserId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send email with credentials if email is provided
    if (cleanData.email) {
      try {
        await sendRiderCredentials(
          cleanData.email,
          cleanData.firstName,
          cleanData.lastName,
          riderCode,
          generatedPassword
        );
        console.log(`Email sent successfully to ${cleanData.email}`);
      } catch (emailError) {
        console.error('Failed to send email to rider:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    // Generate visa acknowledgement for all riders
    try {
      const visaAckResult = await generateVisaAcknowledgement({
        type: 'PRE_SIGNED',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        riderName: `${cleanData.firstName} ${cleanData.lastName}`,
        signatureImage: null,
        nationality: cleanData.nationality || 'N/A',
        idNumber: cleanData.emiratesId || cleanData.passportNumber || riderCode,
        admin: `${defaultUser.firstName} ${defaultUser.lastName}`
      });

      // Save visa acknowledgement record
      await prisma.acknowledgement.create({
        data: {
          riderId: rider.id,
          adminId: defaultUserId,
          type: AcknowledgementType.VISA,
          acknowledgement_description: 'Visa acknowledgement generated automatically upon rider creation',
          fileName: visaAckResult.fileName,
          filePath: visaAckResult.key,
          fileType: visaAckResult.fileType,
          isPreSigned: true
        }
      });
      
      console.log('Visa acknowledgement generated successfully');
    } catch (visaError) {
      console.error('Failed to generate visa acknowledgement:', visaError);
    }

    // Generate SIM acknowledgement if company SIM is assigned
    if (cleanData.companySim) {
      try {
        const simAckResult = await generateSimAcknowledgement({
          type: 'PRE_SIGNED',
          date: new Date().toLocaleDateString(),
          riderName: `${cleanData.firstName} ${cleanData.lastName}`,
          signatureImage: null,
          nationality: cleanData.nationality || 'N/A',
          idNumber: cleanData.emiratesId || cleanData.passportNumber || riderCode,
          admin: `${defaultUser.firstName} ${defaultUser.lastName}`,
          phone: cleanData.companySim
        });

        // Save SIM acknowledgement record
        await prisma.acknowledgement.create({
          data: {
            riderId: rider.id,
            adminId: defaultUserId,
            type: AcknowledgementType.SIM,
            acknowledgement_description: `SIM acknowledgement for number ${cleanData.companySim}`,
            fileName: simAckResult.fileName,
            filePath: simAckResult.key,
            fileType: simAckResult.fileType,
            isPreSigned: true
          }
        });
        
        console.log('SIM acknowledgement generated successfully');
      } catch (simError) {
        console.error('Failed to generate SIM acknowledgement:', simError);
      }
    }
    
    res.status(201).json({
      message: 'Rider created successfully',
      rider,
      emailSent: !!cleanData.email,
      acknowledgements: {
        visa: true,
        sim: !!cleanData.companySim
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create rider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/riders/bulk-upload - Bulk upload riders from CSV
router.post('/bulk-upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    
    // Read and parse CSV file
    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    
    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      await fs.unlink(req.file.path); // Clean up uploaded file
      return res.status(400).json({ error: 'Invalid CSV format' });
    }
    
    if (records.length === 0) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'CSV file is empty' });
    }
    
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    // Get or create a default admin user
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@flcd.com' }
    });
    
    if (!defaultUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@flcd.com',
          firstName: 'Admin',
          lastName: 'User',
          password: hashedPassword
        }
      });
    }
    
    const defaultUserId = defaultUser.id;
    
    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed
      
      try {
        // Map CSV columns to our schema
        const riderData = {
          // Personal Info
          firstName: record.firstName || record.first_name || record['First Name'],
          lastName: record.lastName || record.last_name || record['Last Name'],
          phone: record.phone || record.Phone,
          email: record.email || record.Email,
          nationality: record.nationality || record.Nationality,
          dateOfBirth: record.dateOfBirth || record.date_of_birth || record['Date of Birth'],
          
          // Identity & Compliance
          passportNumber: record.passportNumber || record.passport_number || record['Passport Number'],
          passportExpiry: record.passportExpiry || record.passport_expiry || record['Passport Expiry'],
          emiratesId: record.emiratesId || record.emirates_id || record['Emirates ID'],
          emiratesIdExpiry: record.emiratesIdExpiry || record.emirates_id_expiry || record['Emirates ID Expiry'],
          licenseNumber: record.licenseNumber || record.license_number || record['License Number'],
          licenseExpiry: record.licenseExpiry || record.license_expiry || record['License Expiry'],
          
          // Contact Numbers
          companySim: record.companySim || record.company_sim || record['Company SIM'],
          emergencyPhone: record.emergencyPhone || record.emergency_phone || record['Emergency Phone'],
          
          // Other Info
          languageSpoken: record.languageSpoken || record.language_spoken || record['Language Spoken'],
          cityOfWork: record.cityOfWork || record.city_of_work || record['City of Work'],
          joiningDate: record.joiningDate || record.joining_date || record['Joining Date'],
          bloodGroup: record.bloodGroup || record.blood_group || record['Blood Group'],
          insurancePartner: record.insurancePartner || record.insurance_partner || record['Insurance Partner'],
          insuranceExpiry: record.insuranceExpiry || record.insurance_expiry || record['Insurance Expiry'],
          healthNotes: record.healthNotes || record.health_notes || record['Health Notes'],
          adminNotes: record.adminNotes || record.admin_notes || record['Admin Notes'],
          
          // Partner & Employment
          employeeId: record.employeeId || record.employee_id || record['Employee ID'],
          deliveryPartner: record.deliveryPartner || record.delivery_partner || record['Delivery Partner'],
          deliveryPartnerId: record.deliveryPartnerId || record.delivery_partner_id || record['Delivery Partner ID'],
          
          // Status & Legacy
          employmentStatus: record.employmentStatus || record.employment_status || record['Employment Status'] || 'PENDING',
          address: record.address || record.Address
        };
        
        // Validate the data
        const validatedData = createRiderSchema.parse(riderData);
        
        // Check for duplicates within the CSV and in the database
        const existingRider = await prisma.rider.findFirst({
          where: {
            OR: [
              { phone: validatedData.phone },
              ...(validatedData.email && validatedData.email.trim() ? [{ email: validatedData.email }] : []),
              ...(validatedData.emiratesId && validatedData.emiratesId.trim() ? [{ emiratesId: validatedData.emiratesId }] : []),
              ...(validatedData.passportNumber && validatedData.passportNumber.trim() ? [{ passportNumber: validatedData.passportNumber }] : []),
              ...(validatedData.licenseNumber && validatedData.licenseNumber.trim() ? [{ licenseNumber: validatedData.licenseNumber }] : []),
              ...(validatedData.employeeId && validatedData.employeeId.trim() ? [{ employeeId: validatedData.employeeId }] : [])
            ]
          }
        });
        
        if (existingRider) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            data: riderData,
            error: 'Rider with this phone, email, Emirates ID, passport, or license already exists'
          });
          continue;
        }
        
        // Clean data - convert empty strings to null
        const cleanBulkData = {
          ...validatedData,
          email: validatedData.email && validatedData.email.trim() ? validatedData.email.trim() : null,
          emiratesId: validatedData.emiratesId && validatedData.emiratesId.trim() ? validatedData.emiratesId.trim() : null,
          passportNumber: validatedData.passportNumber && validatedData.passportNumber.trim() ? validatedData.passportNumber.trim() : null,
          licenseNumber: validatedData.licenseNumber && validatedData.licenseNumber.trim() ? validatedData.licenseNumber.trim() : null,
          employeeId: validatedData.employeeId && validatedData.employeeId.trim() ? validatedData.employeeId.trim() : null,
          companySim: validatedData.companySim && validatedData.companySim.trim() ? validatedData.companySim.trim() : null,
          emergencyPhone: validatedData.emergencyPhone && validatedData.emergencyPhone.trim() ? validatedData.emergencyPhone.trim() : null,
          nationality: validatedData.nationality && validatedData.nationality.trim() ? validatedData.nationality.trim() : null,
          languageSpoken: validatedData.languageSpoken && validatedData.languageSpoken.trim() ? validatedData.languageSpoken.trim() : null,
          cityOfWork: validatedData.cityOfWork && validatedData.cityOfWork.trim() ? validatedData.cityOfWork.trim() : null,
          bloodGroup: validatedData.bloodGroup && validatedData.bloodGroup.trim() ? validatedData.bloodGroup.trim() : null,
          insurancePartner: validatedData.insurancePartner && validatedData.insurancePartner.trim() ? validatedData.insurancePartner.trim() : null,
          healthNotes: validatedData.healthNotes && validatedData.healthNotes.trim() ? validatedData.healthNotes.trim() : null,
          adminNotes: validatedData.adminNotes && validatedData.adminNotes.trim() ? validatedData.adminNotes.trim() : null,
          deliveryPartner: validatedData.deliveryPartner && validatedData.deliveryPartner.trim() ? validatedData.deliveryPartner.trim() : null,
          deliveryPartnerId: validatedData.deliveryPartnerId && validatedData.deliveryPartnerId.trim() ? validatedData.deliveryPartnerId.trim() : null,
          address: validatedData.address && validatedData.address.trim() ? validatedData.address.trim() : null
        };

        // Generate unique rider code
        const riderCode = await generateRiderCode();
        
        // Create the rider
        await prisma.rider.create({
          data: {
            ...cleanBulkData,
            riderCode,
            dateOfBirth: cleanBulkData.dateOfBirth ? new Date(cleanBulkData.dateOfBirth) : null,
            passportExpiry: cleanBulkData.passportExpiry ? new Date(cleanBulkData.passportExpiry) : null,
            emiratesIdExpiry: cleanBulkData.emiratesIdExpiry ? new Date(cleanBulkData.emiratesIdExpiry) : null,
            licenseExpiry: cleanBulkData.licenseExpiry ? new Date(cleanBulkData.licenseExpiry) : null,
            joiningDate: cleanBulkData.joiningDate ? new Date(cleanBulkData.joiningDate) : null,
            insuranceExpiry: cleanBulkData.insuranceExpiry ? new Date(cleanBulkData.insuranceExpiry) : null,
            createdById: defaultUserId
          }
        });
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          data: record,
          error: error instanceof z.ZodError ? error.errors : error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);
    
    res.json({
      message: 'Bulk upload completed',
      results
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /riders/template:
 *   get:
 *     summary: Download CSV template
 *     description: Download a CSV template file for bulk rider upload
 *     tags: [Riders]
 *     responses:
 *       200:
 *         description: CSV template file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 */
// GET /api/riders/template - Download CSV template
router.get('/template', (req, res) => {
  const template = [
    'firstName,lastName,phone,email,nationality,dateOfBirth,passportNumber,passportExpiry,emiratesId,emiratesIdExpiry,licenseNumber,licenseExpiry,companySim,emergencyPhone,languageSpoken,cityOfWork,joiningDate,bloodGroup,insurancePartner,insuranceExpiry,healthNotes,adminNotes,employeeId,deliveryPartner,deliveryPartnerId,employmentStatus,address',
    'John,Doe,+971501234567,john.doe@example.com,Indian,1990-01-15,A1234567,2030-12-31,784-1990-1234567-1,2028-12-31,DL123456789,2025-12-31,+971502345678,+971509876543,English,Dubai,2024-01-15,O+,AXA Insurance,2025-12-31,No health issues,Good performer,EMP001,Careem,CAR001,PENDING,"Dubai, UAE"'
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rider_template.csv"');
  res.send(template);
});

// GET /api/riders/:id - Get rider by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documents: true,
        acknowledgments: {
          orderBy: { createdAt: 'desc' }
        },
        generatedAcknowledgements: {
          include: {
            admin: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        vehicleAssignments: {
          include: {
            vehicle: true
          },
          orderBy: { assignedAt: 'desc' }
        }
      }
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    res.json({ rider });
  } catch (error) {
    console.error('Get rider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/riders/:id - Update rider
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateRiderSchema.parse(req.body);
    
    const existingRider = await prisma.rider.findUnique({
      where: { id }
    });
    
    if (!existingRider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Clean update data - convert empty strings to null
    const cleanUpdateData = {
      ...updateData,
      email: updateData.email && updateData.email.trim() ? updateData.email.trim() : null,
      emiratesId: updateData.emiratesId && updateData.emiratesId.trim() ? updateData.emiratesId.trim() : null,
      passportNumber: updateData.passportNumber && updateData.passportNumber.trim() ? updateData.passportNumber.trim() : null,
      licenseNumber: updateData.licenseNumber && updateData.licenseNumber.trim() ? updateData.licenseNumber.trim() : null,
      employeeId: updateData.employeeId && updateData.employeeId.trim() ? updateData.employeeId.trim() : null,
      companySim: updateData.companySim && updateData.companySim.trim() ? updateData.companySim.trim() : null,
      emergencyPhone: updateData.emergencyPhone && updateData.emergencyPhone.trim() ? updateData.emergencyPhone.trim() : null,
      nationality: updateData.nationality && updateData.nationality.trim() ? updateData.nationality.trim() : null,
      languageSpoken: updateData.languageSpoken && updateData.languageSpoken.trim() ? updateData.languageSpoken.trim() : null,
      cityOfWork: updateData.cityOfWork && updateData.cityOfWork.trim() ? updateData.cityOfWork.trim() : null,
      bloodGroup: updateData.bloodGroup && updateData.bloodGroup.trim() ? updateData.bloodGroup.trim() : null,
      insurancePartner: updateData.insurancePartner && updateData.insurancePartner.trim() ? updateData.insurancePartner.trim() : null,
      healthNotes: updateData.healthNotes && updateData.healthNotes.trim() ? updateData.healthNotes.trim() : null,
      adminNotes: updateData.adminNotes && updateData.adminNotes.trim() ? updateData.adminNotes.trim() : null,
      deliveryPartner: updateData.deliveryPartner && updateData.deliveryPartner.trim() ? updateData.deliveryPartner.trim() : null,
      deliveryPartnerId: updateData.deliveryPartnerId && updateData.deliveryPartnerId.trim() ? updateData.deliveryPartnerId.trim() : null,
      address: updateData.address && updateData.address.trim() ? updateData.address.trim() : null
    };

    // Check for unique constraints if they're being updated
    if (updateData.phone || cleanUpdateData.email || cleanUpdateData.emiratesId || cleanUpdateData.passportNumber || cleanUpdateData.licenseNumber || cleanUpdateData.employeeId) {
      const conflictRider = await prisma.rider.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateData.phone ? [{ phone: updateData.phone }] : []),
                ...(cleanUpdateData.email ? [{ email: cleanUpdateData.email }] : []),
                ...(cleanUpdateData.emiratesId ? [{ emiratesId: cleanUpdateData.emiratesId }] : []),
                ...(cleanUpdateData.passportNumber ? [{ passportNumber: cleanUpdateData.passportNumber }] : []),
                ...(cleanUpdateData.licenseNumber ? [{ licenseNumber: cleanUpdateData.licenseNumber }] : []),
                ...(cleanUpdateData.employeeId ? [{ employeeId: cleanUpdateData.employeeId }] : [])
              ]
            }
          ]
        }
      });
      
      if (conflictRider) {
        return res.status(409).json({ error: 'Another rider with this phone, email, Emirates ID, passport, or license already exists' });
      }
    }
    
    const updatedRider = await prisma.rider.update({
      where: { id },
      data: {
        ...cleanUpdateData,
        dateOfBirth: cleanUpdateData.dateOfBirth ? new Date(cleanUpdateData.dateOfBirth) : undefined,
        passportExpiry: cleanUpdateData.passportExpiry ? new Date(cleanUpdateData.passportExpiry) : undefined,
        emiratesIdExpiry: cleanUpdateData.emiratesIdExpiry ? new Date(cleanUpdateData.emiratesIdExpiry) : undefined,
        licenseExpiry: cleanUpdateData.licenseExpiry ? new Date(cleanUpdateData.licenseExpiry) : undefined,
        joiningDate: cleanUpdateData.joiningDate ? new Date(cleanUpdateData.joiningDate) : undefined,
        insuranceExpiry: cleanUpdateData.insuranceExpiry ? new Date(cleanUpdateData.insuranceExpiry) : undefined
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Rider updated successfully',
      rider: updatedRider
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update rider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/riders/:id - Soft delete rider
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const rider = await prisma.rider.findUnique({
      where: { id }
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Soft delete by deactivating
    await prisma.rider.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Rider deactivated successfully' });
  } catch (error) {
    console.error('Delete rider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/riders/:id/acknowledgements/:ackId/status - Update acknowledgement status
router.put('/:id/acknowledgements/:ackId/status', async (req, res) => {
  try {
    const { id: riderId, ackId } = req.params;
    const { status, riderSignature } = req.body;

    // Validate status
    if (!['PENDING', 'ACKNOWLEDGED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be PENDING or ACKNOWLEDGED' });
    }

    // Check if rider exists
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    });

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Check if acknowledgement exists and belongs to this rider
    const acknowledgement = await prisma.acknowledgement.findFirst({
      where: {
        id: ackId,
        riderId: riderId
      }
    });

    if (!acknowledgement) {
      return res.status(404).json({ error: 'Acknowledgement not found' });
    }

    // Update acknowledgement status
    const updatedAck = await prisma.acknowledgement.update({
      where: { id: ackId },
      data: {
        isPreSigned: status === 'PENDING',
        updatedAt: new Date(),
        // You can add rider signature field if needed
        ...(riderSignature && { acknowledgement_description: acknowledgement.acknowledgement_description + ` - Acknowledged by rider on ${new Date().toLocaleDateString()}` })
      },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Acknowledgement status updated successfully',
      acknowledgement: updatedAck
    });
  } catch (error) {
    console.error('Update acknowledgement status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/riders/:id/acknowledgements/:ackId/download - Download acknowledgement PDF
router.get('/:id/acknowledgements/:ackId/download', async (req, res) => {
  try {
    const { id: riderId, ackId } = req.params;

    // Check if rider exists
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    });

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Get acknowledgement
    const acknowledgement = await prisma.acknowledgement.findFirst({
      where: {
        id: ackId,
        riderId: riderId
      }
    });

    if (!acknowledgement) {
      return res.status(404).json({ error: 'Acknowledgement not found' });
    }

    // Check if file exists locally first
    const fs = require('fs');
    const path = require('path');
    const localPath = path.join(__dirname, '../../uploads', acknowledgement.filePath);

    if (fs.existsSync(localPath)) {
      // Serve local file
      res.setHeader('Content-Type', acknowledgement.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${acknowledgement.fileName}"`);
      return res.sendFile(localPath);
    }

    // If not local, try to get from S3
    try {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      // Generate a pre-signed URL for download
      const params = {
        Bucket: process.env.AWS_S3_BUCKET || 'flcd-documents',
        Key: acknowledgement.filePath,
        Expires: 300, // 5 minutes
        ResponseContentDisposition: `attachment; filename="${acknowledgement.fileName}"`
      };

      const url = s3.getSignedUrl('getObject', params);
      
      // For API consistency, return the URL instead of redirecting
      if (req.query.format === 'url') {
        return res.json({ downloadUrl: url });
      }
      
      // Redirect to the S3 pre-signed URL for direct downloads
      return res.redirect(url);
      
    } catch (s3Error) {
      console.error('S3 download error:', s3Error);
      
      // As a last resort, try to regenerate the PDF
      try {
        console.log('Regenerating PDF for download...');
        
        // Get rider details for regeneration
        const fullRider = await prisma.rider.findUnique({
          where: { id: riderId },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        });

        if (!fullRider) {
          return res.status(404).json({ error: 'Rider not found for regeneration' });
        }

        // Import PDF generation functions
        const { generateVisaAcknowledgement, generateSimAcknowledgement } = require('../utils/pdf-generator');
        
        let pdfResult;
        if (acknowledgement.type === 'VISA') {
          pdfResult = await generateVisaAcknowledgement({
            type: 'PRE_SIGNED',
            date: new Date(acknowledgement.createdAt).toLocaleDateString(),
            time: new Date(acknowledgement.createdAt).toLocaleTimeString(),
            riderName: `${fullRider.firstName} ${fullRider.lastName}`,
            signatureImage: null,
            nationality: fullRider.nationality || 'N/A',
            idNumber: fullRider.emiratesId || fullRider.passportNumber || fullRider.riderCode,
            admin: `${fullRider.createdBy.firstName} ${fullRider.createdBy.lastName}`
          });
        } else if (acknowledgement.type === 'SIM') {
          pdfResult = await generateSimAcknowledgement({
            type: 'PRE_SIGNED',
            date: new Date(acknowledgement.createdAt).toLocaleDateString(),
            riderName: `${fullRider.firstName} ${fullRider.lastName}`,
            signatureImage: null,
            nationality: fullRider.nationality || 'N/A',
            idNumber: fullRider.emiratesId || fullRider.passportNumber || fullRider.riderCode,
            admin: `${fullRider.createdBy.firstName} ${fullRider.createdBy.lastName}`,
            phone: fullRider.companySim || 'N/A'
          });
        } else {
          return res.status(404).json({ error: 'Cannot regenerate this type of acknowledgement' });
        }

        // If regeneration was successful and saved locally
        if (pdfResult.localPath && fs.existsSync(pdfResult.localPath)) {
          res.setHeader('Content-Type', acknowledgement.fileType);
          res.setHeader('Content-Disposition', `attachment; filename="${acknowledgement.fileName}"`);
          return res.sendFile(pdfResult.localPath);
        }

        return res.status(404).json({ 
          error: 'File not available',
          message: 'The acknowledgement document could not be retrieved or regenerated'
        });

      } catch (regenError) {
        console.error('PDF regeneration error:', regenError);
        return res.status(500).json({ 
          error: 'File not available',
          message: 'The acknowledgement document is temporarily unavailable'
        });
      }
    }
  } catch (error) {
    console.error('Download acknowledgement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
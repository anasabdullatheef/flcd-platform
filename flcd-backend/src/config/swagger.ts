import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FLCD Platform API',
      version,
      description: 'Fleet Command Platform API Documentation',
      contact: {
        name: 'FLCD Support',
        email: 'support@flcd.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.flcd.com/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Roles',
        description: 'Role and permission management',
      },
      {
        name: 'Riders',
        description: 'Rider management operations',
      },
      {
        name: 'Documents',
        description: 'Document upload and management',
      },
      {
        name: 'Email Configuration',
        description: 'Email configuration management',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phone: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            isActive: {
              type: 'boolean',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Rider: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            riderCode: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phone: {
              type: 'string',
            },
            nationality: {
              type: 'string',
            },
            employmentStatus: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'],
            },
            onboardingStatus: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
            },
            isActive: {
              type: 'boolean',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@flcd.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
            },
            phone: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        },
        CreateRoleRequest: {
          type: 'object',
          required: ['name', 'permissions'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        CreateRiderRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'phone'],
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phone: {
              type: 'string',
            },
            nationality: {
              type: 'string',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
            },
            passportNumber: {
              type: 'string',
            },
            passportExpiry: {
              type: 'string',
              format: 'date',
            },
            emiratesId: {
              type: 'string',
            },
            emiratesIdExpiry: {
              type: 'string',
              format: 'date',
            },
            licenseNumber: {
              type: 'string',
            },
            licenseExpiry: {
              type: 'string',
              format: 'date',
            },
            address: {
              type: 'string',
            },
            employmentStatus: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'],
              default: 'PENDING',
            },
          },
        },
        EmailConfiguration: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            host: {
              type: 'string',
            },
            port: {
              type: 'integer',
            },
            secure: {
              type: 'boolean',
            },
            username: {
              type: 'string',
            },
            fromEmail: {
              type: 'string',
              format: 'email',
            },
            fromName: {
              type: 'string',
            },
            isActive: {
              type: 'boolean',
            },
            isDefault: {
              type: 'boolean',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
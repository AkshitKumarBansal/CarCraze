const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app'); 

// 1. Intercept and mock the email service module BEFORE anything else
jest.mock('../utils/emailService', () => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../config/redisClient', () => ({
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    isOpen: false,
    on: jest.fn(),
}));

// 2. Import the mocked function so we can check if it was triggered
const { sendWelcomeEmail } = require('../utils/emailService');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
    // Clear the mock's memory between tests so counts reset to 0
    jest.clearAllMocks(); 
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth API Routes', () => {
    
    // Your existing negative test
    it('should fail signup if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'test@test.com' });

        expect(res.statusCode).not.toBe(201);
    });

    // The new "Happy Path" test
    it('should successfully create a user and trigger a welcome email', async () => {
        const validUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'securePassword123',
            phone: '+919876543210'
        };

        const res = await request(app)
            .post('/api/auth/signup')
            .send(validUser);
        console.log('Signup response:', res.statusCode, res.body);
        // Assert the database and server responded correctly
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Signup successful');
        expect(res.body.user.email).toBe(validUser.email);
        
        // Assert the backend successfully called our mocked email function
        expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
    });
});
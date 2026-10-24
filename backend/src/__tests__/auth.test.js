const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const crypto = require('crypto');
const User = require('../models/User');

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

    it('should reject an old JWT after a successful password reset', async () => {
        const email = 'reset.integration@example.com';
        const oldPassword = 'InitialPassword123!';
        const newPassword = 'ReplacementPassword456!';

        // 1. Create a real user through the signup API.
        const signupResponse = await request(app)
            .post('/api/auth/signup')
            .send({
                firstName: 'Reset',
                lastName: 'Integration',
                email,
                password: oldPassword,
                phone: '+919876543211'
            });

        expect(signupResponse.statusCode).toBe(201);

        // 2. Sign in and capture the old authentication cookie.
        const signinResponse = await request(app)
            .post('/api/auth/signin')
            .send({
                email,
                password: oldPassword
            });

        expect(signinResponse.statusCode).toBe(200);

        const setCookie = signinResponse.headers['set-cookie'];
        expect(setCookie).toBeDefined();

        const authCookie = setCookie.find(cookie =>
            cookie.startsWith('authToken=')
        );

        expect(authCookie).toBeDefined();

        // Send only the cookie name and value, not its attributes.
        const oldAuthCookie = authCookie.split(';')[0];

        // Verify the old token works before the password reset.
        const beforeResetResponse = await request(app)
            .get('/api/user/profile')
            .set('Cookie', oldAuthCookie);

        expect(beforeResetResponse.statusCode).toBe(200);

        // 3. Create a valid, hashed reset token in the real test database.
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({ email });
        expect(user).not.toBeNull();

        user.passwordResetToken = hashedResetToken;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
        await user.save();

        const oldTokenVersion = user.tokenVersion ?? 0;

        // 4. Reset the password through the actual API.
        const resetResponse = await request(app)
            .post('/api/auth/reset-password')
            .send({
                token: resetToken,
                password: newPassword
            });

        expect(resetResponse.statusCode).toBe(200);

        // Confirm that the database version was incremented.
        const updatedUser = await User.findOne({ email });

        expect(updatedUser.tokenVersion).toBe(oldTokenVersion + 1);
        expect(updatedUser.passwordResetToken).toBeUndefined();
        expect(updatedUser.passwordResetExpires).toBeUndefined();

        
        // 5. Attempt to use the old JWT on a protected endpoint.
        const protectedResponse = await request(app)
            .get('/api/user/profile')
            .set('Cookie', oldAuthCookie);

        expect(protectedResponse.statusCode).toBe(401);

        // 6. Sign in using the new password.
        const newSigninResponse = await request(app)
            .post('/api/auth/signin')
            .send({ email, password: newPassword });

        expect(newSigninResponse.statusCode).toBe(200);

        const newSetCookie = newSigninResponse.headers['set-cookie'];
        expect(newSetCookie).toBeDefined();

        const newAuthCookie = newSetCookie.find(cookie =>
            cookie.startsWith('authToken=')
        );

        expect(newAuthCookie).toBeDefined();

        // 7. Verify the new token works on the protected endpoint.
        const newProtectedResponse = await request(app)
            .get('/api/user/profile')
            .set('Cookie', newAuthCookie.split(';')[0]);

        expect(newProtectedResponse.statusCode).toBe(200);
    });

});
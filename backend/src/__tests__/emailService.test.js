const nodemailer = require('nodemailer');

// 1. Set up the mock BEFORE the emailService is imported
jest.mock('nodemailer', () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });
    return {
        createTransport: jest.fn(() => ({
            sendMail: mockSendMail
        }))
    };
});

// 2. Now import the service (it will automatically use the mocked createTransport)
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

describe('Email Service', () => {
    let mockSendMail;

    beforeAll(() => {
        // Retrieve the mock function that was injected into the transporter
        const transporter = nodemailer.createTransport();
        mockSendMail = transporter.sendMail;
    });

    afterEach(() => {
        // Clear the call count for sendMail between tests so they don't interfere
        mockSendMail.mockClear();
    });

    it('should successfully trigger a welcome email with correct parameters', async () => {
        const mockUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com'
        };

        await sendWelcomeEmail(mockUser);

        // Assert that sendMail was called exactly once
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        
        // Assert that it tried to send to the correct address with the right subject
        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockUser.email,
                subject: expect.stringContaining('Welcome')
            })
        );
    });

    it('should successfully trigger a password reset email', async () => {
        const mockUser = {
            firstName: 'Jane',
            email: 'jane@example.com'
        };
        const mockToken = 'super-secret-reset-token';

        await sendPasswordResetEmail(mockUser, mockToken);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        
        // Assert the token actually made it into the email configuration
        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockUser.email,
                subject: expect.stringContaining('Password Reset')
            })
        );
    });
});

jest.mock('nodemailer', () => {
    const mockSendMail = jest.fn().mockResolvedValue({
        messageId: 'mock-message-id',
    });

    return {
        createTransport: jest.fn(() => ({
            sendMail: mockSendMail,
        })),
        createTestAccount: jest.fn().mockResolvedValue({
            user: 'test@example.com',
            pass: 'test-password',
        }),
        getTestMessageUrl: jest.fn(() => false),
    };
});

const nodemailer = require('nodemailer');
const {
    sendWelcomeEmail,
    sendPasswordResetEmail,
} = require('../utils/emailService');

describe('Email Service', () => {
    let mockSendMail;

    beforeAll(() => {
        // The mock returns the same sendMail function for every transporter.
        mockSendMail = nodemailer.createTransport().sendMail;
    });

    beforeEach(() => {
        mockSendMail.mockClear();
    });

    it('should successfully trigger a welcome email with correct parameters', async () => {
        const mockUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
        };

        await sendWelcomeEmail(mockUser);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockUser.email,
                subject: expect.stringContaining('Welcome'),
            })
        );
    });

    it('should successfully trigger a password reset email', async () => {
        const mockUser = {
            firstName: 'Jane',
            email: 'jane@example.com',
        };
        const mockToken = 'super-secret-reset-token';

        await sendPasswordResetEmail(mockUser, mockToken);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockUser.email,
                subject: expect.stringContaining('Password Reset'),
                html: expect.stringContaining(mockToken),
            })
        );
    });
});

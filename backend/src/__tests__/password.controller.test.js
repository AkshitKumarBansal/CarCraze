
const crypto = require('crypto');

jest.mock('../models/User', () => ({
    findOne: jest.fn()
}));

jest.mock('../utils/emailService', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

const User = require('../models/User');
const {
    resetPassword
} = require('../controllers/auth/password.controller');

describe('resetPassword controller', () => {
    let req;
    let res;
    let user;

    const resetToken = 'test-reset-token-123';
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const validPassword = 'StrongPassword123!';

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {
                token: resetToken,
                password: validPassword
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            clearCookie: jest.fn()
        };

        user = {
            _id: 'test-user-id',
            email: 'testuser@example.com',
            password: 'OldPassword123!',
            tokenVersion: 0,
            passwordResetToken: hashedToken,
            passwordResetExpires: Date.now() + 60 * 60 * 1000,
            save: jest.fn().mockResolvedValue(true)
        };

        User.findOne.mockResolvedValue(user);
    });

    it('should reject a request with a missing reset token', async () => {
        req.body.token = undefined;

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token and new password are required'
        });
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should reject a password shorter than the minimum length', async () => {
        req.body.password = 'Short123!';

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String)
            })
        );
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should reject a password exceeding 72 UTF-8 bytes', async () => {
        req.body.password = 'A'.repeat(73);

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should reject an invalid or expired reset token', async () => {
        User.findOne.mockResolvedValue(null);

        await resetPassword(req, res);

        expect(User.findOne).toHaveBeenCalledWith({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                $gt: expect.any(Number)
            }
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Reset link is invalid or has expired.'
        });
        expect(user.save).not.toHaveBeenCalled();
    });

    it('should update the password and invalidate previous sessions', async () => {
        user.tokenVersion = 4;

        await resetPassword(req, res);

        expect(User.findOne).toHaveBeenCalledWith({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                $gt: expect.any(Number)
            }
        });

        expect(user.password).toBe(validPassword);
        expect(user.tokenVersion).toBe(5);
        expect(user.passwordResetToken).toBeUndefined();
        expect(user.passwordResetExpires).toBeUndefined();

        expect(user.save).toHaveBeenCalledTimes(1);

        expect(res.clearCookie).toHaveBeenCalledWith(
            'authToken',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'strict'
            })
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Password reset successful. Please sign in again.'
        });
    });

    it('should increment tokenVersion from zero when resetting the password', async () => {
        user.tokenVersion = 0;

        await resetPassword(req, res);

        expect(user.tokenVersion).toBe(1);
        expect(user.save).toHaveBeenCalledTimes(1);
    });

    it('should not allow a reset token to be reused', async () => {
        // First reset succeeds.
        await resetPassword(req, res);

        expect(user.passwordResetToken).toBeUndefined();
        expect(user.passwordResetExpires).toBeUndefined();

        // Simulate a second request using the same token.
        jest.clearAllMocks();
        User.findOne.mockResolvedValue(null);

        req.body = {
            token: resetToken,
            password: 'AnotherStrongPassword123!'
        };

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(user.save).toHaveBeenCalledTimes(0);
    });
});

const MIN_PASSWORD_LENGTH = 12;

const validatePassword = (password) => {
    if (typeof password !== 'string') {
        return {
            valid: false,
            message: 'Password is required.'
        };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return {
            valid: false,
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
        };
    }

    // bcrypt has a 72-byte input limit. Reject longer UTF-8
    // passwords rather than silently accepting truncated input.
    if (Buffer.byteLength(password, 'utf8') > 72) {
        return {
            valid: false,
            message: 'Password must not exceed 72 UTF-8 bytes.'
        };
    }

    return { valid: true, message: '' };
};

module.exports = {
    MIN_PASSWORD_LENGTH,
    validatePassword
};
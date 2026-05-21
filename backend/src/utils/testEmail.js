/**
 * Run this from the backend folder:
 *   node src/utils/testEmail.js
 */
require('dotenv').config();
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./emailService');

const fakeUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com'
};

console.log('🔍 Starting email test...');

(async () => {
  try {
    await sendWelcomeEmail(fakeUser);
    console.log('✅ Welcome email test complete. Check terminal above for Preview URL.');
  } catch (err) {
    console.error('❌ Welcome email FAILED:', err.message);
  }

  try {
    await sendPasswordResetEmail(fakeUser, 'test-reset-token-12345');
    console.log('✅ Password reset email test complete. Check terminal above for Preview URL.');
  } catch (err) {
    console.error('❌ Password reset email FAILED:', err.message);
  }
})();

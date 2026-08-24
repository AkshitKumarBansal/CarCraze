const authController = require('./auth.controller');
const passwordController = require('./password.controller');

module.exports = {
    ...authController,
    ...passwordController
};
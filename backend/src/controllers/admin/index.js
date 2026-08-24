const managementController = require('./management.controller');
const accessController = require('./access.controller');
const verificationController = require('./verification.controller');

module.exports = {
    ...managementController,
    ...accessController,
    ...verificationController
};
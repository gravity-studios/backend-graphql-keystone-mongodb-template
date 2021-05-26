const requireResetPassword = require('../controllers/requestResetPassword');
const resetPassword = require('../controllers/resetPassword');

module.exports = (keystone, adapter) => ({
    types: [
        {
            type: 'type ResetPasswordOutput { success: Boolean }',
        },
    ],
    mutations: [
        {
            schema: 'requestResetPassword(email: String!): ResetPasswordOutput',
            resolver: requireResetPassword(adapter),
        },
        {
            schema:
                'resetPassword(token: String!, password: String): ResetPasswordOutput',
            resolver: resetPassword(keystone, adapter),
        },
    ],
});

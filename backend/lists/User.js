const {
    Text,
    Checkbox,
    Password,
    Relationship,
} = require('@keystonejs/fields');

const { isAdmin, isAdminOrUser } = require('../helpers/access');

module.exports = {
    fields: {
        firstName: {
            type: Text,
        },
        lastName: {
            type: Text,
        },
        email: {
            type: Text,
            isUnique: true,
        },
        googleId: { type: Text },
        isAdmin: {
            type: Checkbox,
            // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
            access: {
                update: isAdmin,
            },
        },
        password: {
            type: Password,
        },
        resetPassToken: {
            type: Text,
            access: () => false,
        },
    },
    access: {
        read: isAdminOrUser,
        update: isAdminOrUser,
        delete: isAdmin,
        auth: true,
    },
};

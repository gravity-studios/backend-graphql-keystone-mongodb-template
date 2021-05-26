const { GoogleAuthStrategy } = require('@keystonejs/auth-passport');

module.exports = (keystone) =>
    keystone.createAuthStrategy({
        type: GoogleAuthStrategy,
        list: 'User',
        config: {
            idField: 'googleId',
            appId: process.env.GOOGLE_OAUTH_CLIENT_ID,
            appSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            loginPath: '/auth/google',
            callbackPath: '/auth/google/callback',
            callbackHost: process.env.SERVER_URI,

            resolveCreateData: ({ createData, serviceProfile }) => ({
                ...createData,
                firstName: serviceProfile.name.givenName,
                lastName: serviceProfile.name.familyName,
                email: serviceProfile.emails[0].value,
            }),

            // Once a user is found/created and successfully matched to the
            // googleId, they are authenticated, and the token is returned here.
            // NOTE: By default Keystone sets a `keystone.sid` which authenticates the
            // user for the API domain. If you want to authenticate via another domain,
            // you must pass the `token` as a Bearer Token to GraphQL requests.
            onAuthenticated: async (_, req, res) => {
                res.redirect(`${process.env.FRONTEND_URI}/auth/google/success`);
            },

            onError: (errors, req, res) => {
                const error = Array.isArray(errors) ? errors[0] : errors;
                let { message } = error;

                if (
                    error.message ===
                    'Unable to create a passportSession.item<User>'
                ) {
                    message =
                        'Email is already registered using password authentication';
                }

                res.redirect(
                    `${process.env.FRONTEND_URI}/auth/google/error?msg=${message}`,
                );
            },
        },
    });

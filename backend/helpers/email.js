const SES = require('aws-sdk/clients/sesv2');

const client = new SES({ region: 'us-east-2' });

const send = ({ subject, html, user: { email, firstName, lastName } }) =>
    client
        .sendEmail({
            Content: {
                Simple: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: html,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject,
                    },
                },
            },
            Destination: {
                ToAddresses: [
                    firstName && lastName
                        ? `${firstName} ${lastName} <${email}>`
                        : email,
                ],
            },
            FromEmailAddress:
                'PROJECT_NAME.TOP_LEVEL_DOMAIN <noreply@PROJECT_NAME.TOP_LEVEL_DOMAIN>',
        })
        .promise();

module.exports = {
    send,
    sendResetPassEmail: (user, token) =>
        send({
            subject:
                'Your PROJECT_NAME.TOP_LEVEL_DOMAIN Password Reset Request',
            html: `Hey there,<br/><br/>To reset your password, <a href="${`${process.env.FRONTEND_URI}/passwordreset?token=${token}`}">click here</a>.`,
            user,
        }),
};

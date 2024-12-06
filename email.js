const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// OAuth2 Configuration
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(recipient, subject, body, attachment = null) {
    try {
        const accessToken = await oauth2Client.getAccessToken();
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'nithinrash4@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'SENDER NAME <nithinrash4@gmail.com>',
            to: recipient,
            subject: subject,
            text: body,
            attachments: attachment ? [{
                filename: 'qr-code.png',
                content: attachment.split(',')[1],
                encoding: 'base64'
            }] : []
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
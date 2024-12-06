// Import the nodemailer module
const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alertcollege00@gmail.com', // Your Gmail address
        pass: 'xkiz ingm zdmu oywd'   // Your Gmail password or App Password
    }
});

// Set up email data with unicode symbols
let mailOptions = {
    from: '"Your Name" <nkrash91@gmail.com>', // Sender address
    to: 'shaikfa66@gmail.com',                // List of receivers
    subject: 'Hello from esp32 aksjhbcfahvcfb.js',              // Subject line
    text: 'Hello world?',                       // Plain text body
    html: '<b>Hello world?</b>'                 // HTML body content
};

// Send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});

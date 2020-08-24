const nodemailer = require("nodemailer");
require('dotenv').config();

exports.sendMail = async function(mailObject, logMessage) {
    // let transporter = nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     secure: false,
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS
    //     },
    //     tls: {
    //         ciphers: 'SSLv3'
    //     }
    // });

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    let info = await transporter.sendMail(mailObject);

    console.log("[mailer] %s: %s", logMessage, info.messageId);
};
const nodemailer = require("nodemailer");
require('dotenv').config();

exports.sendMail = async function(mailObject, logMessage) {
    let transporter = nodemailer.createTransport({
        host: process.env.email_host,
        port: process.env.email_port,
        secure: false,
        auth: {
            user: process.env.email_user,
            pass: process.env.email_pass
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    let info = await transporter.sendMail(mailObject);

    console.log("[mailer] %s: %s", logMessage, info.messageId);
};
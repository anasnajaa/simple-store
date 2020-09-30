const mailer = require('../util/mailer');
const accounts = require('./accounts');

const template = (error)=>{
    try {
        return `${error.stack.split("\n")}`;
    } catch (e) {
        return `${error.message}`;
    }
}

exports.sendEmail = (error) => {
    mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: accounts.developers,
        subject: "Exception in API",
        html: template(error)
    }, "email sent").catch(console.error);
};
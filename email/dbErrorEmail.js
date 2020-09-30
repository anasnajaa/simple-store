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
        to: accounts.databaseAdmins,
        subject: "Exception in Database",
        html: template(error)
    }, "email sent").catch(console.error);
};
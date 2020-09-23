const mailer = require('../util/mailer');

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
        to: "spidernet12@gmail.com",
        subject: "Exception in API",
        html: template(error)
    }, "email sent").catch(console.error);
};
const mailer = require('../util/mailer');

const template = (user)=>{
    return `
    Hello ${user.email}, welcome to simple store.
    `;
}

exports.sendEmail = (t, user) => {
    mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Simple Store - Welcome!",
        html: template(user)
    }, "email sent").catch(console.error);
};
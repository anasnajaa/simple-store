const leadModel = require('../models/leads')

exports.get_landing = (req, res, next) => {
    res.render('landing', {
        title: 'Express'
    });
};

exports.submit_lead = (req, res, next) => {
    const email = req.body.lead_email;

    leadModel.add_email(email)
        .then(db=>{
            if(db.rowCount === 1) {
                res.redirect("/");
            } else {
                res.redirect("/error");
            }
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });

    const sendEmail = () => {
        mailer.sendMail({
            from: '"NoReply" <noreply@domain.com>',
            to: email,
            subject: "subject",
            html: `message`
        }, "email sent").catch(console.error);
    };
};


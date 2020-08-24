const leadModel = require('../models/leads')

const sendEmail = () => {
    mailer.sendMail({
        from: '"NoReply" <noreply@domain.com>',
        to: email,
        subject: "subject",
        html: `message`
    }, "email sent").catch(console.error);
};

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
                res.redirect("/leads");
            } else {
                res.redirect("/error");
            }
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.show_leads = (req, res, next)=>{
    leadModel.findAll()
        .then(rows=>{
            res.render('landing', {leads: rows});
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

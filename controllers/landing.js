const leadModel = require('../models/leads.model');
const mailer = require('../util/mailer');
const util = require('../util/common');
require('dotenv').config();

const sendEmail = (email) => {
    mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "subject",
        html: `message`
    }, "email sent").catch(console.error);
};

exports.get_landing = (req, res) => {
    res.render('landing', {
        title: 'Express',
        leads: [],
        util
    });
};

exports.submit_lead = (req, res) => {
    const email = req.body.lead_email;

    leadModel.add_email(email)
        .then(db=>{
            if(db.rowCount === 1) {
                //sendEmail(email);
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

exports.show_leads = (req, res)=>{
    leadModel.findAll()
        .then(rows=>{
            res.render('landing', {leads: rows, util},);
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.show_lead = (req, res)=>{
    const id = req.params.id;

    leadModel.findOne(id)
        .then(rows=>{
            res.render('lead', {lead: rows[0]});
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.show_edit_lead = (req, res)=> {
    const id = req.params.id;

    leadModel.findOne(id)
        .then(rows=>{
            res.render('lead/edit_lead', {lead: rows[0]});
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.edit_lead = (req, res)=> {
    const id = req.params.id;
    const email = req.body.lead_email;

    leadModel.updateOne(id, email)
        .then(rowsAffected=>{
            console.log(rowsAffected);
            res.redirect('/lead/'+id);
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.delete_lead = (req, res) => {
    const id = req.params.id;

    leadModel.deleteOne(id)
        .then(rowsAffected=>{
            console.log(rowsAffected);
            res.redirect('/leads');
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.api_delete_lead = (req, res) => {
    const id = req.params.id;
  
    leadModel.deleteOne(id)
    .then(rowsAffected=>{
        res.json({
            deleted: rowsAffected
        });
    })
    .catch(error=>{
        console.log(error);
        res.json({
            error
        });
    });
};
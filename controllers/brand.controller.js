const { render } = require('../util/express');
const leadModel = require('../models/leads.model');

exports.submit_brand = (req, res, next) => {
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

exports.show_brands = (req, res, next)=>{
    leadModel.findAll()
        .then(rows=>{
            const data = {leads: rows};
            render(req, res, next, 'lead/leads_list', data);
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.show_brand = (req, res, next)=>{
    const id = req.params.id;

    leadModel.findOne(id)
        .then(rows=>{
            const data = {lead: rows[0]};
            render(req, res, next, 'lead', data);
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.show_edit_brand = (req, res, next)=> {
    const id = req.params.id;

    leadModel.findOne(id)
        .then(rows=>{
            const data = {lead: rows[0]};
            render(req, res, next, 'lead/edit_lead', data);
        })
        .catch(error=>{
            console.log(error);
            res.redirect("/error");
        });
};

exports.edit_brand = (req, res, next)=> {
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

exports.delete_brand = (req, res, next) => {
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

exports.api_delete_brand = (req, res, next) => {
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
const { merge } = require('lodash');
const util = require('./common');

exports.render = (req, res, next, url, data)=>{
    res.render(url, merge(data, {util, user: req.user, fm: req.flash("fm")}));
}

exports.flash =  (req, type, title, body)=>{
    req.flash('fm', {type, title, body});
}

exports.renderError =  (req, res, next, error)=>{
    console.log(error);
    res.redirect("/error");
}
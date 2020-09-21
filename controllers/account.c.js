const userModel = require('../models/user.m');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { render } = require('../util/express');
const mailer = require('../util/mailer');

const viewAccount = "account/home";
const viewProfile = "account/profile";

exports.page_dashboard = (req, res, next)=>{
    render(req, res, next, viewAccount, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account", active: true}
        ]
    });
}

exports.page_profile = (req, res, next)=>{
    render(req, res, next, viewProfile, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account"}, 
            {title: "profile", url:"/account/profile", active: true}
        ]
    });
}

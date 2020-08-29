require('dotenv').config();
const userModel = require('../models/user.model');
const passport = require('passport');
const myPassport = require('../util/passport_setup')(passport);
const bcrypt = require('bcrypt');
const { validateUserSignup, vEmail, vEmpty } = require('../validators');
const { isEmpty } = require('lodash');
const { render, flash } = require('../util/express');
const mailer = require('../util/mailer');
const { v4 } = require('uuid');

const viewLogin = "user.login.ejs";
const viewSignup = "user.signup.ejs";

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.show_login = (req, res, next) => {
    const data = {formData: {}, errors: {}};
    render(req, res, next, viewLogin, data);
};

exports.show_signup = (req, res, next) => {
    const data = {formData: {}, errors: {}};
    render(req, res, next, viewSignup, data);
};

const rerender_signup = (errors, req, res, next)=> {
    const data = {formData: req.body, errors};
    render(req, res, next, viewSignup, data);
};

const rerender_login = (errors, req, res, next)=> {
    const data = {formData: req.body, errors};
    render(req, res, next, viewLogin, data);
};

const sendActivationEmail = (user) => {
    mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Simple Store - Activation Instructions",
        html: `Please click on this link to activate your account: ${user.activation_id}`
    }, "email sent").catch(console.error);
};

const sendWelcomeEmail = (user) => {
    mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Simple Store - Welcome!",
        html: `Hello ${user.email}, welcome to simple store.`
    }, "email sent").catch(console.error);
};

exports.signup = async (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const password = generateHash(plainTextPassword);

    try {
        const errors = await validateUserSignup({}, email, plainTextPassword);

        if(!isEmpty(errors)){
            rerender_signup(errors, req, res, next);
            return;
        }

        const userObject = {
            email,
            password,
            username: email,
            date_created: new Date(),
            is_active: false,
            activation_id: v4()
        };

        userModel.addNewCustomer(userObject, (error, createdUser)=>{
            if(error){
                flash(req, "danger", null, "Account creation failed");
                render(req, res, next, viewSignup, {formData: req.body, errors});
                return;
            } else {
                sendActivationEmail(createdUser);
                sendWelcomeEmail(createdUser);
                flash(req, "success", "Account created!", "Please check your email for instructions on how to activate your account");
                render(req, res, next, viewLogin, {formData: {}, errors: {}});
            }
        });

    } catch (error) {
        flash(req, "danger", null, error);
        render(req, res, next, viewSignup, {});
    }
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const rememberUser = req.body.remember;
    let errors = {};
    try {
        vEmail(errors, email);
        vEmpty(errors, plainTextPassword, "password");

        if(!isEmpty(errors)){
            rerender_login(errors, req, res, next);
            return;
        }

        passport.authenticate("local", (err, user)=>{
            if(err){
                rerender_login(errors, req, res, next);
            } else {
                if (rememberUser) {
                    req.session.cookie.expires = false;
                }
                req.session.passport = {user: user.id};
                req.session.save((err) => {
                    res.redirect('/');
                });
            }
        })(req, res, next);

    } catch(error) {
        flash(req, "danger", null, error);
        render(req, res, next, viewLogin, {});
    }
};

exports.logout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
};
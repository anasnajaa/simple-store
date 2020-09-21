require('dotenv').config();
const userModel = require('../models/user.m');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { validateUserSignup, vEmail, vEmpty } = require('../validators');
const { isEmpty } = require('lodash');
const { render, flash } = require('../util/express');
const mailer = require('../util/mailer');
const { v4 } = require('uuid');
const jwtAuth = require('../util/jwtAuth');

const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];

const r = require('../util/codedResponses');

const viewLogin = "account/login";
const viewSignup = "account/signup";

const validPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.page_login = (req, res, next) => {
    const data = {formData: {}, errors: {}};
    render(req, res, next, viewLogin, data);
};

exports.page_signup = (req, res, next) => {
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

exports.admin_signup = async (req, res, next) => {
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

exports.admin_login = (req, res, next) => {
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

exports.admin_logout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
};

exports.api_login = async (req, res, next) => {
    const t = req.__;
    try {
        const {username, password} = req.body;

        const user = await userModel.findOneByEmail(username);
        
        if(user === null){
            res.json({status: -1, message: r.account_doesnt_exist_active(t)});
            return;
        }
        
        if (!validPassword(user, password)) {
            res.json({status: -1, message: r.wrong_user_pass(t)});
            return;
        }
        
        const token = jwtAuth.generateToken(user);
        
        if (token) {
            res.cookie('token', token, {
                expires: stage.jwtCookieExpiry,
                secure: stage.jwtSecure,
                httpOnly: true,
            }).json({
                status: 1, 
                token, 
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    roles: user.roles
                }
            });
        } else {
            res.json({status: -1, error: r.failed_to_login_contact_support(t)});
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

exports.api_logout = (req, res, next) => {
    const tr = req.__;
    try {
        res.cookie('token', '', {
            expires: new Date(Date.now()),
            secure: stage.jwtSecure,
            httpOnly: true,
            maxAge: 0,
            overwrite: true
          }).json({status: 1});
    } catch (error) {
        req.status(500).json({ error });
    }
}

exports.api_profile = (req, res, next) => {

}
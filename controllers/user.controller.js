const userModel = require('../models/user.model');
const passport = require('passport');
const myPassport = require('../util/passport_setup')(passport);
const bcrypt = require('bcrypt');
const { validateUserSignup, validateUserSignin } = require('../validators');
const { isEmpty } = require('lodash');

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.show_login = (req, res) => {
    res.render('user/login', {formData: {}, errors: {}, user: req.user});
};

exports.show_signup = (req, res) => {
    res.render('user/signup', {formData: {}, errors: {}, user: req.user});
};

const rerender_signup = (errors, req, res, next)=> {
    res.render('user/signup', {formData: req.body, errors, user: req.user});
};

const rerender_signin = (errors, req, res, next)=> {
    res.render('user/login', {formData: req.body, errors, user: req.user});
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
            is_active: true,
            date_created: new Date()
        };

        const newUser = await userModel.createUser(userObject);
        const newAdminRole = await userModel.addAdminRoleToUser(newUser.id);

        if(newUser === null){
            req.flash('error', "Account creation failed");
            res.render('user/signup', {});
            return;
        }

        await passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/signup",
            failureFlash: true
        })(req, res, next);

    } catch (error) {
        console.log(error);
        req.flash('error', "Error: "+ error);
        res.render('user/signup', {});
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    try {
        const errors = await validateUserSignin({}, email, plainTextPassword);

        if(!isEmpty(errors)){
            rerender_signin(errors, req, res, next);
            return;
        }

        await passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/login",
            failureFlash: true
        })(req, res, next);

    } catch(error) {

    }
};

exports.logout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    //res.user = null;
    //req.session.save(() => res.redirect("/"));
    
    res.redirect('/');
};
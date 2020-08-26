const userModel = require('../models/user.model');
const passport = require('passport');
const util = require('../util/common');
const myPassport = require('../util/passport_setup')(passport);
const bcrypt = require('bcrypt');
const { validateUser } = require('../validators');
const { isEmpty } = require('lodash');

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.show_login = (req, res) => {
    res.render('user/login', {formData: {}, errors: {}, user: req.user, util});
};

exports.show_signup = (req, res) => {
    res.render('user/signup', {formData: {}, errors: {}, user: req.user, util});
};

const rerender_signup = (errors, req, res, next)=> {
    res.render('user/signup', {formData: req.body, errors, user: req.user, util});
};

exports.signup = async (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const password = generateHash(plainTextPassword);

    try {
        const errors = await validateUser({}, email, plainTextPassword);

        if(!isEmpty(errors)){
            rerender_signup(errors, req, res, next);
            return;
        }

        // const existingUser = await userModel.findOneByEmail(email);
        // if(existingUser !== null){
        //     req.flash('message', "Account already exist");
        //     res.render('user/signup', {user: req.user});
        //     return;
        // }

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
            req.flash('message', "Account creation failed");
            res.render('user/signup', {user: req.user, util});
            return;
        }

        await passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/signup",
            failureFlash: true
        })(req, res, next);

    } catch (error) {
        console.log(error);
        req.flash('message', "Error: "+ error);
        res.render('user/signup', {user: req.user, util});
    }
};

exports.login = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
};
const userModel = require('../models/user.model');
const passport = require('passport');
const myPassport = require('../util/passport_setup')(passport);
const bcrypt = require('bcrypt');

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.show_login = (req, res) => {
    res.render('user/login', {formData: {}, error: {}, user: req.user});
};

exports.show_signup = (req, res) => {
    res.render('user/signup', {formData: {}, error: {}, user: req.user});
};

exports.signup = async (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const password = generateHash(plainTextPassword);

    try {
        const existingUser = await userModel.findOneByEmail(email);
        if(existingUser !== null){
            req.flash('message', "Account already exist");
            res.render('user/signup', {user: req.user});
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
        if(newUser === null){
            req.flash('message', "Account creation failed");
            res.render('user/signup', {user: req.user});
            return;
        }

        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/signup",
            failureFlash: true
        })(req, res, next);

    } catch (error) {
        console.log(error);
        req.flash('message', "Error: "+ error);
        res.render('user/signup', {user: req.user});
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
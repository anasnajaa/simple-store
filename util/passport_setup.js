const userModel = require('../models/user.model');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { flash } = require('../util/express');

const sUser = (user, cb) => {
    cb(null, user.id);
};

const dSerUser = (id, cb) => {
    try {
        userModel.findOneById(id).then(user=> {
            if(user === null){
                cb(new Error("Wrong user id."), null);
            }
    
            cb(null, user);
        });
    } catch (error) {
        cb(error, null);
    }
};

const validPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

const authFunction = (req, email, password, cb) => {
    try {
        userModel.findOneByEmail(email).then(existingUser => {

            if (existingUser === null) {
                flash(req, "danger", null, "Wrong username/password combination");
                return cb(true, null);
            }
    
            if (!existingUser.is_active) {
                flash(req, "danger", null, "Please activate your account using the email sent to you");
                return cb(true, null);
            }
    
            if (existingUser.password === undefined || existingUser.password === null) {
                flash(req, "danger", null, "Please reset your password using the email sent to you");
                return cb(true, null);
            }
    
            if (!validPassword(existingUser, password)) {
                flash(req, "danger", null, "Wrong username/password combination");
                return cb(true, null);
            }

            return cb(null, existingUser);
        });
    } catch (error) {
        flash(req, "danger", null, error);
        return cb(error, null);
    }
};

module.exports = (passport) => {
    passport.serializeUser(sUser);
    passport.deserializeUser(dSerUser);
    passport.use(new localStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, authFunction));
};
const userModel = require('../models/user.model');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport');

const sUser = (user, done) => {
    done(null, user.id);
};

const dSerUser = async (id, done) => {
    try {
        const user = await userModel.findOneById(id);
        
        if(user === null){
            done(new Error("Wrong user id."));
        }

        done(null, user);

    } catch (error) {
        console.log(error);
        done(error);
    }
};

const validPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

const authFunction = async (req, email, password, done) => {
    try {
        const existingUser = await userModel.findOneByEmail(email);

        if (existingUser === null) {
            req.flash('message', 'Wrong username/password combination');
            return done(null, false);
        }

        if (!existingUser.is_active) {
            req.flash('message', 'Please activate your account using the email sent to you');
            return done(null, false);
        }

        if (existingUser.password === undefined || existingUser.password === null) {
            req.flash('message', 'Please reset your password using the email sent to you');
            return done(null, false);
        }

        if (!validPassword(existingUser, password)) {
            req.flash('message', 'Wrong username/password combination');
            return done(null, false);
        }

        return done(null, existingUser);

    } catch (error) {
        console.log(error);
        req.flash('message', 'Error:' + error);
        return done(error, false);
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
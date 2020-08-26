const userModel = require('../models/user.model');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport');

const sUser = (user, done)=>{
    done(null, user.id);
};

const dSerUser = (id, done)=>{
    userModel.findOne(id)
    .then(rows=>{
        if(rows && rows.length > 0){
            done(null, rows[0]);
        } else {
            done(new Error("Wrong user id."));
        }
    })
    .catch(error=>{
        console.log(error);
        done(error);
    });
};

const validPassword = (user, password)=>{
    return bcrypt.compareSync(password, user.password);
};

const authFunction = (req, email, password, done)=>{
    userModel.findOneByEmail(email)
    .then(rows=>{
        if(rows && rows.length > 0){
            const user = rows[0];
            if(!user.is_active){
                req.flash('message', 'Please activate your account using the email sent to you');
                return done(null, false);
            } else if(user.password === undefined || user.password === null){
                req.flash('message', 'Please reset your password using the email sent to you');
                return done(null, false);
            } else if(!validPassword(user, password)){
                req.flash('message', 'Wrong username/password combination');
                return done(null, false);
            }
            return done(null, user);
        } else {
            req.flash('message', 'Wrong username/password combination');
            return done(null, false);
        }
    })
    .catch(error=>{
        req.flash('message', 'Error:' + error);
        console.log(error);
        return done(error, false);
    });
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
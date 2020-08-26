const userModel = require('../models/user.model');
const passport = require('passport');
const myPassport = require('../util/passport_setup')(passport);
const bcrypt = require('bcrypt');

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.show_login = (req, res) => {
    res.render('user/login', {formData: {}, error: {}});
};

exports.show_signup = (req, res) => {
    res.render('user/signup', {formData: {}, error: {}});
};

exports.login = (req, res) => {
    res.render('user/signup', {formData: {}, error: {}});
};

exports.signup = (req, res, next) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const password = generateHash(plainTextPassword);

    const createUser = ()=>{
        const userObject = {
            email,
            password,
            username: email,
            is_active: true,
            date_created: "now()"
        };

        userModel.createUser(userObject)
        .then(rows=>{
            const id = rows[0];
            passport.authenticate("local", {
                successRedirect: "/",
                failureRedirect: "/signup",
                failureFlash: true
            })(req, res, next);
        })
        .catch(error=>{
            //res.render('user/signup', {formData: {}, error: {}});
        });
    }

    userModel.findOneByEmail(email)
    .then(rows=>{
        if(rows.length === 0){
            createUser();
        } else {
            req.flash('message', "Account already exist");
            res.render('user/signup');
        }
    })
    .catch(error=>{
        console.log(error);
    });
};
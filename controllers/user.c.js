require('dotenv').config();
const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const r = require('../util/codedResponses');
const {apiError} = require('../util/errorHandler');
const smsService = require('../util/sms');

const userModel = require('../models/user.m');
const bcrypt = require('bcrypt');
const { vEmail, vEmpty, vPassword, vUserExist, vNumeric } = require('../validators');
const { isEmpty } = require('lodash');
const { v4 } = require('uuid');
const jwtAuth = require('../util/jwtAuth');
const accountActivationEmail = require('../email/accountActivation');
const welcomeEmail = require('../email/welcomeEmail');

const validPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password);
};

const generateHash = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.register = async (req, res, next) => {
    const t = req.__;
    const {
        email,
        password,
        firstName,
        lastName,
        phone
    } = req.body;
    
    let errors = {};

    try {
        vEmpty(errors, firstName, "firstName");
        vEmpty(errors, lastName, "lastName");
        vEmail(errors, email);
        vPassword(errors, password);
        
        if(isEmpty(errors)){
            await vUserExist(errors, email);
        }

        if(!isEmpty(errors)){
            res.json({status: -1, validationErrors: errors})
            return;
        }

        const userObject = {
            first_name: firstName,
            last_name: lastName,
            email,
            password: generateHash(password),
            username: email,
            date_created: new Date(),
            is_active: false,
            activation_id: v4()
        };

        const addedUserDetails = await userModel.addNewCustomer(userObject, phone);

        accountActivationEmail.sendEmail(t, addedUserDetails.user);
        welcomeEmail.sendEmail(t, addedUserDetails.user);

        res.json({status: 1, message: r.registration_success_check_email(t)});

    } catch (error) {
        apiError(res, error);
    }
};

exports.activateAccount = async (req, res, next) => {
    const t = req.__;
    try {
        const key = req.query.key;
        let errors = {};
        vEmpty(errors, key, "key");

        if(!isEmpty(errors)){
            res.json({status: -1, validationErrors: errors})
            return;
        }
        
        const user = await userModel.activateUser(key);

        if(user){
            res.json({status: 1, message: r.account_verified_you_can_login(t)});
        } else {
            res.json({status: -1, message: r.invalid_activation_key(t)});
        }
    } catch (error) {
        apiError(res, error);
    }
};

exports.sendContactVerificationCode = async (req, res, next) => {
    const t = req.__;
    try {
        const contactId = req.body.contactId;
        const user = req.user;

        let errors = {};
        vNumeric(errors, contactId, "contactId");

        if(!isEmpty(errors)){
            res.json({status: -1, validationErrors: errors});
            return;
        }

        const contactDetails = await userModel.getUserContactActivationDetails(user.id, contactId);

        if(contactDetails.verifications_count > 2 ) {
            res.json({status: -1, message: r.contact_verification_count_exceeded(t)});
            return;
        }

        const messageResponse = await smsService.sendMessage(
            contactDetails.contact, 
            `${t("your_verification_code")}: ${contactDetails.verification_id}`);

        const updatedContactDetails = await userModel.updateVerificationCount(contactId, contactDetails.verifications_count + 1);

        res.json({
            status: 1,
            updatedContactDetails
        });

    } catch (error) {
        apiError(res, error);
    }
};

exports.verifiyContact = async (req, res, next) => {
    const t = req.__;
    try {
        const {contactId, verificationId} = req.body;

        const user = req.user;

        let errors = {};
        vNumeric(errors, contactId, "contactId");
        vEmpty(errors, verificationId, "verificationId");

        if(!isEmpty(errors)){
            res.json({status: -1, validationErrors: errors})
            return;
        }

        const verifiedContactDetails = await userModel
        .verifyUserContact(user.id, contactId, verificationId);

        if(verifiedContactDetails === null){
            res.json({status: -1, message: r.contact_verification_failed(t)})
        }

    } catch (error) {
        apiError(res, error);
    }
}

exports.login = async (req, res, next) => {
    const t = req.__;
    try {
        const {username, password} = req.body;
        let errors = {};

        vEmail(errors, username);
        vEmpty(errors, password, "password");

        const user = await userModel.findOneByEmail(username);
        
        if(user === null){
            res.json({status: -1, message: r.account_doesnt_exist_active(t)});
            return;
        }

        if(!user.is_active){
            res.json({status: -1, message: r.you_must_verifiy_account_to_login(t)});
            return;
        }
        
        if (!validPassword(user, password)) {
            res.json({status: -1, message: r.wrong_user_pass(t)});
            return;
        }
        
        const token = jwtAuth.generateToken(user);
        
        if (token) {
            res.cookie('token', token, stage.jwtCookieOptions)
            .json({
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
        console.log(error);
        apiError(res, error);
    }
}

exports.logout = (req, res, next) => {
    const tr = req.__;
    try {
        const options = stage.jwtCookieOptions;
        options.expires = new Date(Date.now());
        options.maxAge = 0;
        options.overwrite = true;

        res.cookie('token', '', options).json({status: 1});
    } catch (error) {
        apiError(res, error);
    }
}

exports.profile = async (req, res, next) => {
    try {
        const jwtUser = req.user;
        const user = await userModel.findOneByEmail(jwtUser.email);

        delete user.date_created;
        delete user.date_updated;
        delete user.activation_id;
        delete user.password;

        res.json({
            status: 1,
            user
        });

    } catch (error) {
        apiError(res, error);
    }
}
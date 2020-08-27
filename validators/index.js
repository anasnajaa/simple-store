const validator = require('validator');
const userModel = require('../models/user.model');

const vEmail = (errors, email)=> {
    if(!validator.isEmail(email)) {
        errors["email"] = "Please use valid email";
    }
};

const vPassword = (errors, password)=> {
    if(!validator.isAscii(password)) {
        errors["password"] = "Invalid characters used in the password";
    }
    if(!validator.isLength(password, {min: 8, max: 25})){
        errors["password"] = "Password length must be not less than 8 characters and not more than 25 characters";
    }
};

const vUserExist = async (errors, email) => {
    const existingUser = await userModel.findOneByEmail(email);
    if(existingUser !== null){
        errors["email"] = "Account already exist";
    }
};

const vUserDoesNotExist = async (errors, email) => {
    const existingUser = await userModel.findOneByEmail(email);
    if(existingUser === null){
        errors["email"] = "Account does not exist";
    }
};

const validateUserSignup = async (errors, email, password) => {
    vEmail(errors, email);
    vPassword(errors, password);
    if(!errors || !errors["email"]){
        await vUserExist(errors, email);
    }
    return errors;
}

const validateUserSignin = async (errors, email, password) => {
    vEmail(errors, email);
    vPassword(errors, password);
    return errors;
}

module.exports = {
    validateUserSignup,
    validateUserSignin,
    vUserExist,
    vPassword,
    vEmail
}
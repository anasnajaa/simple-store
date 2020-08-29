const validator = require('validator');
const userModel = require('../models/user.model');
const brandModel = require('../models/brand.model');

exports.vEmail = (errors, email)=> {
    if(!validator.isEmail(email)) {
        errors["email"] = "Please use valid email";
    }
};

exports.vEmpty = (errors, value, fieldName)=> {
    if(validator.isEmpty(value)) {
        errors[fieldName] = "This field is required";
    }
};

exports.vPassword = (errors, password)=> {
    if(!validator.isAscii(password)) {
        errors["password"] = "Invalid characters used in the password";
    }
    if(!validator.isLength(password, {min: 8, max: 25})){
        errors["password"] = "Password length must be not less than 8 characters and not more than 25 characters";
    }
};

exports.vUserExist = async (errors, email) => {
    const existingUser = await userModel.findOneByEmail(email);
    if(existingUser !== null){
        errors["email"] = "Account already exist";
    }
};

exports.vBrandExist = async (key, errors, name) => {
    const exist = await brandModel.findOneByName(name);
    if(exist !== null){
        errors[key] = "Brand already exist";
    }
};

exports.vUserDoesNotExist = async (errors, email) => {
    const existingUser = await userModel.findOneByEmail(email);
    if(existingUser === null){
        errors["email"] = "Account does not exist";
    }
};

exports.validateUserSignup = async (errors, email, password) => {
    this.vEmail(errors, email);
    this.vPassword(errors, password);
    if(!errors || !errors["email"]){
        await this.vUserExist(errors, email);
    }
    return errors;
}

exports.validateUserSignin = async (errors, email, password) => {
    this.vEmail(errors, email);
    this.vPassword(errors, password);
    return errors;
}
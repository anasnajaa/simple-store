const validator = require('validator');
const userModel = require('../models/user.m');
const brandModel = require('../models/brand.m');

exports.vEmail = (errors, email)=> {
    if(!validator.isEmail(email)) {
        errors["email"] = "Please use valid email";
    }
};

exports.vEmpty = (errors, value, fieldName)=> {
    if(!value || validator.isEmpty(value)) {
        errors[fieldName] = "This field is required";
    }
};

exports.vNumeric = (errors, value, fieldName)=> {
    if(value !== undefined && value !== null) {
        if(!validator.isNumeric(value.toString())){
            errors[fieldName] = "Must be a number";
        }
    } else {
        errors[fieldName] = "Must be a number";
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

exports.vBrandExist = async (fieldName, errors, name) => {
    const exist = await brandModel.findOneByName(name);
    if(exist !== null){
        errors[fieldName] = "Brand already exist";
    }
};

exports.vUserDoesNotExist = async (errors, email) => {
    const existingUser = await userModel.findOneByEmail(email);
    if(existingUser === null){
        errors["email"] = "Account does not exist";
    }
};

exports.vIsJpegFile = (fieldName, errors, file)=>{
    if(file.mimetype !== "image/jpeg"){
        errors[fieldName] = "Uploaded file must be a picture of type JPEG";
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
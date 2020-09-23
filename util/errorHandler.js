require('dotenv').config();
const errorEmail = require('../email/apiErrorEmail');
const environment = process.env.NODE_ENV;

exports.apiError = (res, error)=> {
    if (environment !== 'production') {
        res.status(500).json({status: -1, error: error.message});
        console.log(error);
    } else {
        res.status(500).json({status: -1, error: "Server Error, please contact support"});
        errorEmail.sendEmail(error);
    }
}
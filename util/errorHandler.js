require('dotenv').config();
const apiMail = require('../email/apiErrorEmail');
const dbMail = require('../email/dbErrorEmail');
const environment = process.env.NODE_ENV;

exports.apiError = (res, error) => {
    if (environment !== 'production') {
        res.status(500).json({status: -1, error: error.message});
        console.log(error);
    } else {
        res.status(500).json({status: -1, error: "Server Error, please contact support"});
        apiMail.sendEmail(error);
    }
}

exports.databaseError = (error) => {
    if (environment !== 'production') {
        console.log(error);
    } else {
        dbMail.sendEmail(error);
    }
}
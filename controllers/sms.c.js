require('dotenv').config();
const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const client = require('twilio')(stage.sms.accountSid, stage.sms.authToken);
const smsModel = require('../models/sms.m');
const {merge} = require('lodash');
const {apiError} = require('../util/errorHandler');

exports.sendMessage =  (type, to, body)=> {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await new smsModel({
                type,
                to,
                body,
                date_created: new Date(),
                date_updated: null,
                date_sent: null
            }).save();

            const response = await client.messages
            .create({
                from: stage.sms.fromNumber,
                statusCallback: stage.publicUrl + '/api/sms/update-sms-status',
                body,
                to
             });

             message.date_sent = new Date();
             merge(message, response);
             await message.save();

             resolve({serviceResponse: response, addedRecord: message});
        } catch (error) {
            reject(error);
        }
    });
}

exports.updateMessageStatus = async (req, res, next)=>{
    try {
        const sms = req.body;
        sms.date_updated = new Date();
        const result = await smsModel.updateOne({ sid: sms.SmsSid }, sms).exec();
        res.status(200).json({status: 1, result});
    } catch (error) {
        apiError(error);
    }
};

exports.getMessages = async (req, res, next) => {

};
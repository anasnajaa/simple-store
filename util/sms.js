require('dotenv').config();
const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const client = require('twilio')(stage.sms.accountSid, stage.sms.authToken);
const smsModel = require('../models/sms.m');

exports.sendMessage =  (to, body)=> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await client.messages
            .create({
                from: stage.sms.fromNumber,
                statusCallback: stage.publicUrl + '/api/update-sms-status',
                body,
                to
             });
             const newRecord = await new smsModel(response).save();
             resolve({serviceResponse: response, addedRecord: newRecord});
        } catch (error) {
            console.log("Message failed", error);
            reject(error);
        }
    });
}
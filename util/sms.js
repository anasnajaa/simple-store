require('dotenv').config();
const environment = process.env.NODE_ENV;
const stage = require('./config/index')[environment];
const client = require('twilio')(stage.sms.accountSid, stage.sms.authToken);
const smsModel = require('../models/sms.m');

exports.sendMessage = async (to, body)=> {
    try {
        const response = await client.messages
        .create({
            from: '+15017122661',
            statusCallback: stage.publicUrl + '/api/update-sms-status',
            body,
            to
         });
         const newRecord = await new smsModel(response).save();
         console.log("Message ok", response, newRecord);
    } catch (error) {
        console.log("Message failed", error);
    }
}
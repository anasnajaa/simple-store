const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    account_sid: { type: String, required: false },
    api_version: { type: String, required: false },
    body: { type: String, required: false },
    date_created: { type: String, required: false },
    date_sent: { type: String, required: false },
    date_updated: { type: String, required: false },
    direction: { type: String, required: false },
    error_code: { type: String, required: false },
    error_message: { type: String, required: false },
    from: { type: String, required: false },
    messaging_service_sid: { type: String, required: false },
    num_media: { type: String, required: false },
    num_segments: { type: String, required: false },
    price: { type: String, required: false },
    sid: { type: String, required: false },
    status: { type: String, required: false },
    to: { type: String, required: false },
    uri: { type: String, required: false },
    SmsStatus: { type: String, required: false },
    MessageStatus: { type: String, required: false }
}, 
{ timestamps: false}, 
{ _id: false });

const SMS = mongoose.model('SMS', schema);

module.exports = SMS; 
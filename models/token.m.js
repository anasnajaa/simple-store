const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    token: { type: String, required: false },
    user: { type: Object, required: false },
    lastActive: { type: Date, required: false },
    lastIp: { type: String, required: false },
    lastUserAgent: { type: Object, required: false },
    isExpired: { type: Boolean, required: false },
}, 
{ timestamps: true});

const Tokens = mongoose.model('Tokens', schema);

module.exports = Tokens; 
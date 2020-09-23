const smsModel = require('../models/sms.m');

exports.init = (router)=>{
    router.post('/update-sms-status', async (req, res, next)=>{
        const sms = req.body;
        const result = await smsModel.updateOne({ sid: sms.SmsSid }, sms).exec();
        console.log(result);
    });
}
const smsController = require('../controllers/sms.c');
const { isAdmin } = require('../middleware/hasAuth');

exports.init = (router)=>{
    router.post('/sms/update-sms-status', smsController.updateMessageStatus);
    router.post('/sms/send', isAdmin, smsController.sendMessage);
    router.get('/sms/messages', isAdmin, smsController.getMessages);
}
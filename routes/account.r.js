const { isLoggedIn, isLoggedOut } = require('../middleware/hasAuth');
const user = require('../controllers/user.c');

exports.init = (router)=>{
    router.post('/account/login', user.login);
    router.post('/account/logout', user.logout);
    router.get('/account/profile', isLoggedIn, user.profile);
    router.post('/account/register', user.register);
    router.get('/account/activate', user.activateAccount);

    router.post('/account/sendContactVerificationCode', isLoggedIn, user.sendContactVerificationCode);
    router.post('/account/verifiyContact', isLoggedIn, user.verifiyContact);
    
    return router;
};
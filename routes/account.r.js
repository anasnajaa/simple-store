const { isLoggedIn, isAdmin } = require('../middleware/hasAuth');
const user = require('../controllers/user.c');

exports.init = (router)=>{
    router.post('/account/login', user.login);
    router.post('/account/logout', isLoggedIn, user.logout);
    router.get('/account/profile', isAdmin, user.profile);
    router.post('/account/register', user.register);
    router.get('/account/activate', user.activateAccount);
    return router;
};
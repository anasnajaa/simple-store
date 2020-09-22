const { isLoggedIn, isAdmin } = require('../../middleware/hasAuth');
const user = require('../../controllers/user.c');

exports.init = (router)=>{
    router.post('/account/login', user.api_login);
    router.post('/account/logout', isLoggedIn, user.api_logout);
    router.get('/account/profile', isAdmin, user.api_profile);
    return router;
};
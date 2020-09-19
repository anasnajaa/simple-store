const { jwt_isLoggedIn, jwt_isAdmin } = require('../middleware/hasAuth');
const user = require('../controllers/user.controller');

exports.init = (router)=>{
    router.post('/account/login', user.api_login);
    router.post('/account/logout', jwt_isLoggedIn, user.api_logout);

    router.get('/account/profile', jwt_isAdmin, user.api_profile);

    return router;
};
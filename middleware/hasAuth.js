const createError = require('http-errors');

const hasRole = (roles, roleName)=>{
    for(let i = 0; i< roles.length; i++){
        if(roles[i].name === roleName){
            return true;
        }
    }
    return false;
}

exports.isLoggedIn = (req, res, next) => {
    if(req.user){
        next();
    } else {
        next(createError(404, "Page does not exist"));
    }
}

exports.isAdmin = (req, res, next) => {
    if(req.user && req.user.roles && req.user.roles.length > 0){
        const roles = req.user.roles;
        if(hasRole(roles, "admin")){
            next();
        } else {
            next(createError(401, "Only logged in admins can view this page"));
        }
    } else {
        next(createError(401, "Only logged in admins can view this page"));
    }
}

exports.isCustomer = (req, res, next) => {
    if(req.user && req.user.roles && req.user.roles.length > 0){
        const roles = req.user.roles;
        if(hasRole(roles, "customer")){
            next();
        } else {
            next(createError(401, "Only logged in customers can view this page"));
        }
    } else {
        next(createError(401, "Only logged in customers can view this page"));
    }
}
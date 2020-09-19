const createError = require('http-errors');
const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const r = require('../util/codedResponses');
const jwt = require('jsonwebtoken');

const hasRole = (roles, roleName) => {
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === roleName) {
            return true;
        }
    }
    return false;
}

exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        next(createError(401, "You must be logged in to view this page"));
    }
}

exports.isLoggedOut = (req, res, next) => {
    if (req.user === undefined || req.user === null) {
        next();
    } else {
        next(createError(401, "You cannot access this page right now"));
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.length > 0) {
        const roles = req.user.roles;
        if (hasRole(roles, "admin")) {
            next();
        } else {
            next(createError(401, "Only logged in admins can view this page"));
        }
    } else {
        next(createError(401, "Only logged in admins can view this page"));
    }
}

exports.isCustomer = (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.length > 0) {
        const roles = req.user.roles;
        if (hasRole(roles, "customer")) {
            next();
        } else {
            next(createError(401, "Only logged in customers can view this page"));
        }
    } else {
        next(createError(401, "Only logged in customers can view this page"));
    }
}

const retriveJwtToken = (req)=> {
    return new Promise((resolve, reject) => {
        try {
            const t = req.__;
            const jwtToken = req.cookies.token || null;

            const user = jwt.verify(jwtToken, stage.jwtSecret, stage.jwtOption);
            console.log("JWT verefied");
            resolve(user);
        } catch (err) {
            console.log("JWT verification failed", err.message)
            if (err.message === "jwt expired") {
                error = r.auth_expired(t);
            } else {
                error = r.auth_error(t);
            }
            reject(error);
        }
    });
}

exports.jwt_isLoggedIn = async (req, res, next) => {
    try {
        const t = req.__;
        const user = await retriveJwtToken(req);
        req.user = user;
        next();
    } catch(error) {
        console.log("Access denied for route", req.url);
        res.status(401).send({
            status: 401,
            error: r.auth_no_token(t)
        });
    }
}

exports.jwt_isAdmin = async (req, res, next) => {
    try {
        const t = req.__;
        const user = await retriveJwtToken(req);
        for(let i in user.roles){
            if(user.roles[i].id === 1){
                req.user = user;
                next();
                return;
            }
        }
        res.status(401).send({
            status: 401,
            error: r.auth_no_permission(t)
        });
    } catch(error) {
        console.log("Access denied for route", req.url);
        res.status(401).send({
            status: 401,
            error: r.auth_no_token(t)
        });
    }
}
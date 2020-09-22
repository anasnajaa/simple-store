const createError = require('http-errors');
const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const r = require('../util/codedResponses');
const jwt = require('jsonwebtoken');

const retriveJwtToken = (req)=> {
    return new Promise((resolve, reject) => {
        const t = req.__;
        try {
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

exports.isLoggedIn = async (req, res, next) => {
    const t = req.__;
    try {
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

exports.isAdmin = async (req, res, next) => {
    const t = req.__;
    try {
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
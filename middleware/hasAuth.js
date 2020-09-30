const environment = process.env.NODE_ENV;
const stage = require('../config/index')[environment];
const r = require('../locales/codedResponses');
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token.m');
const {clientIp} = require('../util/express');

const removeTokenCookie = async (response) => {
    const options = {...stage.jwtCookieOptions};
    options.expires = new Date(Date.now());
    options.maxAge = 0;
    options.overwrite = true;
    response.cookie('token', '', options);
}

const resolveError = (t, res, error) => {
    if(error.message === "Expired"){
        res.status(440).send({
            status: 440,
            error: r.auth_expired(t)
        });
    } else {
        res.status(401).send({
            status: 401,
            error: r.auth_no_token(t)
        });
    }
}

const retriveJwtToken = (req, res)=> {
    return new Promise(async (resolve, reject) => {
        const t = req.__;
        try {
            const jwtToken = req.cookies.token || null;
            jwt.verify(jwtToken, stage.jwtSecret, stage.jwtOption);
            const token = await tokenModel.findOne({token: jwtToken, isExpired: false}).exec();
            if(token){
                token.lastActive = new Date();
                token.lastIp = clientIp(req);
                token.lastUserAgent = req.useragent;
                await token.save();
                resolve(token.user);
            } else {
                removeTokenCookie(res);
                reject(new Error("Expired"));
            }
        } catch (err) {
            reject(err);
        }
    });
}

exports.isLoggedOut = async (req, res, next) => {
    const t = req.__;
    const jwtToken = req.cookies.token || null;
    if(jwtToken){
        res.status(401).send({
            status: 401,
            error: r.you_must_be_logged_out(t)
        }); 
    } else {
        next();
    }
}

exports.isLoggedIn = async (req, res, next) => {
    const t = req.__;
    try {
        const user = await retriveJwtToken(req, res);
        req.user = user;
        next();
    } catch(error) {
        resolveError(t, res, error);
    }
}

exports.isAdmin = async (req, res, next) => {
    const t = req.__;
    try {
        const user = await retriveJwtToken(req, res);
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
        resolveError(t, res, error);
    }
}
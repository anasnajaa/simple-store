const stage = require('../config/index')[process.env.NODE_ENV];
const jwt = require('jsonwebtoken');
const {clientIp} = require('../util/express');
const tokenModel = require('../models/token.m');

module.exports = {
  generateToken: (payload) => {
    return jwt.sign(payload, stage.jwtSecret, stage.jwtOption);;
  },
  generateApiToken: async (request, user) => {
    let token = null;
    try {
      token = jwt.sign({user: user.id}, stage.jwtSecret, stage.jwtOption);
      await new tokenModel({
        token,
        user,
        lastActive: new Date(),
        lastIp: clientIp(request),
        lastUserAgent: request.useragent,
        isExpired: false
      }).save();
    } catch (err) {
      token = null;
      console.log(err);
    }
    return token;
  },
  expireApiToken: async (request) => {
    const jwtToken = request.cookies.token || null;
    if(jwtToken){
      await tokenModel.updateOne({ token: jwtToken, isExpired: false }, 
        {isExpired: true}).exec();
    }
  },
  getDecryptedToken: (req) => {
    try {
      const jwtToken = req.cookies.token || null;
      if(jwtToken){
        return jwt.verify(jwtToken, stage.jwtSecret, stage.jwtOption);
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
};
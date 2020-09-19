const stage = require('../config/index')[process.env.NODE_ENV];
const jwt = require('jsonwebtoken');

module.exports = {
  generateToken: (payload) => {
    let token = null;
    try {
      token = jwt.sign(payload, stage.jwtSecret, stage.jwtOption);
    } catch (err) {
      token = null;
    }
    return token;
  }
};
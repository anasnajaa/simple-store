const { request } = require("express");

exports.clientIp = (request) => {
    return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
}
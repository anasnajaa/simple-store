require('dotenv').config();
const consoleLogger = require('morgan');
const databaseLogger = require('mongoose-morgan');
const {getDecryptedToken} = require('../util/jwtAuth');

const environment = process.env.NODE_ENV;

const getTokenValue = (req) => {
    const token = getDecryptedToken(req);
    return token ? token.user : null;
};

const getUserAgentDetails = (req) => {
    const detailsObject = req.useragent;
    return token ? token.user : null;
};

consoleLogger.token('token',  (req) => getTokenValue(req));
databaseLogger.token('token', (req) => getTokenValue(req));

const productionLogFormat = ":remote-user,:method,:url,:status,:response-time,:token";
const developmentLogFormat = ":method\t:status\t:response-time\tID :token\t:url";

exports.init = (mongouri, app) => {
    if (environment !== 'production') {
        app.use(consoleLogger(developmentLogFormat));
    } else {
        app.use(databaseLogger({connectionString: mongouri}, {}, productionLogFormat));
    }
}
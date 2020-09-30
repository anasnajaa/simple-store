const {RateLimiterMongo} = require('rate-limiter-flexible');
let rateLimiterMongo; 

exports.init = (mongoConn) => {
    rateLimiterMongo = new RateLimiterMongo({
        storeClient: mongoConn,
        keyPrefix: 'rateLimiter',
        points: 5,
        duration: 1
    });
}

exports.rateLimiterMiddleware = (req, res, next) => {
    rateLimiterMongo.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({
                status: 429,
                error: "Too many requests"
            });
        });
};
module.exports = {
    development: {
        port: process.env.PORT || 3000,
        saltingRounds: 10,
        corsOptions: {
            origin: [
                "http://localhost:8080",
                "http://localhost:3000"
            ],
            credentials: true
        },
        jwtSecure: false,
        jwtCookieExpiry: new Date(Date.now() + 604800000),
        jwtOption: { expiresIn: '1d', issuer: process.env.ISSUER },
        jwtSecret: process.env.JWT_SECRET,
        mongoUri: process.env.ATLAS_URI_RW,
        sessionSecret: process.env.SESSION_SECRET,
        mailer: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT
        }
    },
    production: {
        port: process.env.PORT || 80,
        saltingRounds: 10,
        corsOptions: {
            origin: [
                '*'
            ],
            credentials: true
        },
        jwtSecure: true,
        jwtCookieExpiry: new Date(Date.now() + 604800000),
        jwtOption: { expiresIn: '1d', issuer: process.env.ISSUER },
        jwtSecret: process.env.JWT_SECRET,
        mongoUri: process.env.ATLAS_URI_RW,
        sessionSecret: process.env.SESSION_SECRET,
        mailer: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT
        }
    }
}
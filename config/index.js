module.exports = {
    development: {
        port: process.env.PORT || 3000,
        rootUrl: "http://localhost:"+process.env.PORT,
        publicUrl: "https://a-simple-store.herokuapp.com",
        saltingRounds: 10,
        corsOptions: {
            origin: ["http://localhost:8080"],
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
        },
        sms: {
            accountSid: process.env.TWILIO_ACC_SID,
            authToken: process.env.TWILIO_AUTH,
            fromNumber: process.env.TWILIO_FROM
        }
    },
    production: {
        port: process.env.PORT || 80,
        rootUrl: "https://a-simple-store.herokuapp.com",
        publicUrl: "https://a-simple-store.herokuapp.com",
        saltingRounds: 10,
        corsOptions: {
            origin: ['https://simple-store-admin.herokuapp.com'],
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
        },
        sms: {
            accountSid: process.env.TWILIO_ACC_SID,
            authToken: process.env.TWILIO_AUTH,
            fromNumber: process.env.TWILIO_FROM
        }
    }
}
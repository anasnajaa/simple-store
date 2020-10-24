const {v4} = require('uuid');
const {isCaptchaValid} = require('../util/cpatcha');
const{contentServer} = require('../util/awake');

exports.init = (router)=>{
    router.get('/awake', async (req, res, next)=>{
        const contentServerAwake = await contentServer();
        res.json({
            id: v4(),
            contentServerAwake
        });
    });

    router.get("/captcha", async(req, res, next) => {
        const key = req.query.key;
        const captchaResult = await isCaptchaValid(key);
        res.json({
            isValid: captchaResult
        })
    });
}
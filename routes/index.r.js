const apiRouter = require('./api/index.r');

exports.init = (app)=>{
    app.use('/api', apiRouter);
}
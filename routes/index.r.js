const mainRouter = require('./pages/index.r');
const adminRouter = require('./adminPages/index.r');
const apiRouter = require('./api/index.r');

exports.init = (app)=>{
    app.use('/', mainRouter);
    app.use('/admin', adminRouter);
    app.use('/api', apiRouter);
}
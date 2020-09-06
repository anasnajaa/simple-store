const mainRouter = require('./main.router');
const adminRouter = require('./admin.router');
const apiRouter = require('./api.router');
const accountRouter = require('./account.router')

exports.init = (app)=>{
    app.use('/', mainRouter);
    app.use('/admin', adminRouter);
    app.use('/api', apiRouter);
    app.use('/account', accountRouter);
}
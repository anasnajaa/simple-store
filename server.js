require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');

const connectFlash = require('connect-flash');
const { flash } = require('./util/express');

const indexRouter = require('./routes/index.router');
const adminRouter = require('./routes/admin.router');
const apiRouter = require('./routes/api.router');

require('./util/passport_setup')(passport);

const app = express();
app.use(require('express-status-monitor')());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({
    url: process.env.ATLAS_URI_RW
  }),
  cookie: {
    maxAge: 1 * 1 * 60 * 1000 //1 hour
  }
}));

app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session({}));

app.use((req, res, next) => {
  // const session = JSON.parse(req.cookies['session'] || '');
  // if (session && new Date(session.expires) < new Date()) {
  //     flash(req, "info", null, "your session expired, please login again");
  // }
   next();
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || '80', () => {
  console.log('Server started on: ' + process.env.PORT);
});
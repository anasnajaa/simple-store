require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');

const connectFlash = require('connect-flash');
const { flash } = require('./util/express');
const routes = require('./routes/index.router');

require('./util/passport_setup')(passport);

const environment = process.env.NODE_ENV;
const stage = require('./config/index')[environment];

// mongo db
mongoose.connect(stage.mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const connection = mongoose.connection;
connection.once('open', () => console.log("MongoDB connection established"));

// server config

const app = express();

i18n.configure({
  locales: ['en', 'ar'],
  cookie: 'lang',
  queryParameter: 'lang',
  directory: './locales'
});

app.disable('x-powered-by'); 

app.use(cors(stage.corsOptions));
app.use(require('express-status-monitor')());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(session({
  secret: stage.sessionSecret, 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({
    url: stage.mongoUri
  }),
  cookie: {
    maxAge: 1 * 5 * 60 * 1000 // 5 minutes
  }
}));

if (environment !== 'production') {
    app.use(logger('dev'));
}

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

routes.init(app);

app.use((req, res, next) => {
  next(createError(404));
});

app.listen(stage.port || '80', () => {
  console.log('Server started on: ' + stage.port);
});
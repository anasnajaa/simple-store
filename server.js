require('dotenv').config();
const express = require('express');
const cors = require('cors');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const router = require('./routes/index.r');

const environment = process.env.NODE_ENV;
const stage = require('./config/index')[environment];

// mongo db
mongoose.connect(stage.mongoUri, { 
  useNewUrlParser: true, 
  useCreateIndex: true, 
  useUnifiedTopology: true
});
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

if (environment !== 'production') {
    app.use(morgan('dev'));
}

app.use('/api', router);

app.listen(stage.port || '80', () => {
  console.log('Server started on: ' + stage.port);
});
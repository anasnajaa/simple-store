require('dotenv').config();
const express = require('express');
const cors = require('cors');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const router = require('./routes/index.r');
const useragent = require('express-useragent');
const logger = require('./util/logger');
const helmet = require('helmet');
const localsConfig = require('./locales/config');
const rateLimiter = require('./middleware/rateLimiter');

const environment = process.env.NODE_ENV;
const stage = require('./config/index')[environment];

// mongo db
mongoose.connect(stage.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', () => {
  // server config
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors(stage.corsOptions));
  app.use(require('express-status-monitor')());
  app.use(useragent.express());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser());
  app.use(fileUpload());

  i18n.configure(localsConfig);
  app.use(i18n.init);

  logger.init(stage.mongoUri, app);

  rateLimiter.init(connection);
  app.use(rateLimiter.rateLimiterMiddleware);

  app.use('/api', router);

  app.listen(stage.port, () => console.log("Server Started"));
});
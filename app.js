require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const hbs = require('hbs');
const compression = require('compression');
const helmet = require('helmet');

const inventoryRouter = require('./routes/inventory');

const app = express();

// Set up mongoose connection
const devDbUrl =
  'mongodb+srv://daxas:daxasinvenrotyapp@cluster0.gqw43.mongodb.net/inventory_app?retryWrites=true&w=majority';
const mongoDB = process.env.MONGODB_URI || devDbUrl;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
hbs.registerHelper('ifCond', (v1, v2, options) => {
  if (v1 && v2) {
    if (v1.toString() === v2.toString()) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
});

hbs.registerHelper('encodeMyString', (inputData) => {
  if (inputData) {
    return new hbs.SafeString(inputData);
  }
  return '';
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression()); // Compress all routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', inventoryRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

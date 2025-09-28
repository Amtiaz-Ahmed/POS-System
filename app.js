var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const connectDB = require("./config/database");
var productsRouter = require('./routes/product');
var reportsRouter = require('./routes/reports');
var ordersRouter = require('./routes/order');
const receiptRoutes = require("./routes/receipt"); 
const expressLayouts = require("express-ejs-layouts");


// DB connect
connectDB();

var app = express();

// view engine setup

app.use(expressLayouts);              // enable layouts
app.set("layout", "layout"); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product', productsRouter);
app.use('/reports', reportsRouter);
app.use("/", receiptRoutes);
app.use("/order", ordersRouter);
// catch 404 and forward to er
// ror handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

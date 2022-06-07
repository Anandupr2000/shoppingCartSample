var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var hbs = require('express-handlebars')
var hbs = require('express-handlebars')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var fileUpload = require('express-fileupload'); // library for handling files
// importing db connection file
var db = require('./config/dbConnect')

// importing session library to handle session 
var session = require('express-session');
const { registerHelper } = require('hbs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // all views are set here
app.set('view engine', 'hbs');

// creating custom register helper for performing compare operation
var h = hbs.create({})
h.handlebars.registerHelper("lt",function (value1,value2){return value1<value2?true:false})

//setting up engine for layout and partials
app.engine('hbs',hbs.engine({
  // helpers:require("./public/javascripts/helpers/registerHelpers"),
  extname:'hbs',defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',
}))


// by app.use() we add middle-ware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload())

/**
 * all session are stored in server and cookies are stored in client
 * creating session
 * session uses one argument as object of secretKey and parameters for cookie such as expiretime,etc 
 * whenever there is no response from client after specified maxtime (900000 = fifteen minute) the session for that client is closed
 */
app.use(session({secret:"Key",cookie:{maxAge:900000}})) // sesion created ,then assign session to logged in user


db.connect( // must be called before router (sometimes data need to be retrieved on first loading)
            (err)=>{
              if(err) console.log("Connection Error "+err);
              else console.log("Database connected to port 27017")
            }
          )
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
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

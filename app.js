var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var expressSession = require('express-session');
var flash = require('connect-flash');
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(expressSession);

var config = require('./config/config');

var users = require('./routes/users');
var scenarios = require('./routes/scenarios');

var passportConfig = require('./auth/passport-config');
var restrict = require('./auth/restrict');
passportConfig();

mongoose.connect(config.db);

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession(
    {
        secret: config.secret,
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
           mongooseConnection: mongoose.connection
        })
    }
));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', users);
//app.use(restrict);
app.use('/api/scenarios', scenarios);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500).send({error: err.message});
});

// production error handler
// no stacktraces leaked to user
/* app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
*/


module.exports = app;
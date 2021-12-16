var createError = require('http-errors');
var express = require('express');
var compression = require('compression');
var helmet = require('helmet');
var path = require('path');
var cors = require('cors');
var logger = require('morgan');
const passport = require('passport');
var cookieParser = require('cookie-parser');
require('./config/passport');

require('dotenv').config();
require('./config/database').connect();

var indexRouter = require('./routes/index');

var app = express();

//cors
var corsOptions = {
    // white lists
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://172.19.12.149:3001',
        'http://172.19.12.149:3000',
    ],
    credentials: true,
};

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compress all routes
app.use(helmet());

// cors
app.set('trust proxy', 1); // trusting proxy
// passport
app.use(passport.initialize());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// passport serialize
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = app;

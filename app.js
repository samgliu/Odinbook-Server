var createError = require('http-errors');
var express = require('express');
var compression = require('compression');
var helmet = require('helmet');
var path = require('path');
var cors = require('cors');
var logger = require('morgan');
const passport = require('passport');
var cookieParser = require('cookie-parser');
const session = require('express-session');
require('./config/passport');
require('dotenv').config();
require('./config/database').connect();

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* 
//cors
var corsOptions = {
    // white lists
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://172.19.133.104:3001',
        'http://172.19.133.104:3000',
    ],
    credentials: true,
};

app.use(cors(corsOptions));
*/

app.use(function secure(req, res, next) {
    req.headers['x-forwarded-proto'] = 'https';
    next();
});

/*
app.get('*', function (req, res, next) {
    if (req.get('x-forwarded-proto') != 'https') {
        res.set('x-forwarded-proto', 'https');
        //res.redirect('https://' + req.get('host') + req.url);
    } else {
        next();
    }
});
*/
app.use(function (req, res, next) {
    var allowedDomains = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://172.19.133.104:3001',
        'http://172.19.133.104:3000',
    ];
    var origin = req.headers.origin;
    if (allowedDomains.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, X-Access-Token, X-Refresh-Token' //,x-access-token
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compress all routes
app.use(helmet());

app.set('trust proxy', 1); // trusting proxy
app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true,
            sameSite: 'none',
            httpOnly: true,
        },
    })
);

// passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
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

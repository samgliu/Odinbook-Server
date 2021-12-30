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
app.use(express.static(path.join(__dirname, '/public')));
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

//beginning of socket.io===============
const io = require('socket.io')(8900, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => {
        if (user.userId === userId) {
            // fixing when freshed page which changes the socketId
            user.socketId = socketId;
            return true;
        }
    }) && users.push({ userId, socketId });
    console.log(users);
};

const removeUser = (socketId) => {
    users = users.filter((user) => users.socketId !== socketId);
    console.log(users);
};

const getUser = async (userId) => {
    theUser = users.find((user) => user.userId === userId);
    return theUser;
};

io.on('connection', (socket) => {
    console.log('A user connected with ID: ' + socket.id);
    // connect userId and socketId
    console.log(' %s sockets connected', io.engine.clientsCount);
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });

    // send and get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        console.log(socket.id);
        const user = getUser(receiverId).then((theUser) => {
            console.log('users');
            console.log(users);
            console.log('user');
            console.log(theUser);
            console.log({ senderId, receiverId, text });
            //console.log(theUser.socketId);

            if (theUser && theUser.socketId) {
                console.log(theUser.socketId);
                socket.broadcast.to(theUser.socketId).emit('getMessage', {
                    receiverId: receiverId,
                    senderId: senderId,
                    text: text,
                });
            }

            /*
            if (theUser.socketId) {
                io.to(theUser.socketId).emit('getMessage', {
                    senderId,
                    text,
                });
            }
            */

            //group emit
            /*
            io.emit('getMessage', {
                receiverId: receiverId,
                senderId: senderId,
                text: senderId,
            });*/
        });
    });

    // disconnect
    socket.on('disconnet', () => {
        console.log('A user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});
//end of socket.io===============

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

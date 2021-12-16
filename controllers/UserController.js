const User = require('../models/user');
const Post = require('../models/post');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const refreshTokenList = {};
require('dotenv').config();

function getNewAccessToken(id) {
    return jwt.sign({ id: id }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: +process.env.ACCESS_TOKEN_TIME,
    });
}

/* index_get */
exports.index_get = async (req, res, next) => {
    //console.log(req.decoded);
    const userData = await User.findById(req.decoded.id)
        .populate('Friends')
        .populate('FriendRequests')
        .populate('Posts');
    res.json(userData);
};

/* refreshNewAccessToken_get */
exports.refreshNewAccessToken_get = (req, res, next) => {
    try {
        const rToken = req.cookies['refreshToken'];
        const decoded = jwt.verify(rToken, process.env.REFRESH_TOKEN_KEY);
        //console.log(decoded.id);
        const newToken = getNewAccessToken(decoded.id);
        res.json({ accessToken: newToken });
    } catch (err) {
        console.log(err);
        res.status(401).json({ msg: 'Invalid refresh token' });
    }
};

/* sign_up */
exports.signup_get = function (req, res, next) {
    res.json('signup_get');
};

exports.signup_post = [
    // Validate and sanitize the name field.
    body('firstname', 'Firstname required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('lastname', 'Lastname required').trim().isLength({ min: 1 }).escape(),
    body('username').custom((value, { req }) => {
        // verify email existence
        return new Promise((resolve, reject) => {
            User.findOne({ Username: req.body.username }, function (err, user) {
                if (err) {
                    reject(new Error('Server Error'));
                }
                if (Boolean(user)) {
                    reject(new Error('Username already in use'));
                }
                resolve(true);
            });
        });
    }),
    body('email').custom((value, { req }) => {
        // verify email existence
        return new Promise((resolve, reject) => {
            User.findOne({ Email: req.body.email }, function (err, user) {
                if (err) {
                    reject(new Error('Server Error'));
                }
                if (Boolean(user)) {
                    reject(new Error('E-mail already in use'));
                }
                resolve(true);
            });
        });
    }),
    body('password', 'Password required').isLength({ min: 5 }).escape(),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match! Try again.');
        }
        return true;
    }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ errors: errors });
        } else {
            bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
                // if err, do something
                // otherwise, store hashedPassword in DB
                if (err) {
                    res.status(500).json({ msg: 'error' });
                }
                const avatar = req.body.avatar
                    ? req.body.avatar
                    : '/avatars/defaultAvatar.png';
                const user = new User({
                    Firstname: req.body.firstname,
                    Lastname: req.body.lastname,
                    Username: req.body.username,
                    Password: hashedPassword,
                    Email: req.body.email,
                    Avatar: avatar,
                }).save((err, rest) => {
                    if (err) {
                        res.status(500).json({ msg: 'error' });
                    } else {
                        res.status(200).json('register success');
                    }
                });
            });
        }
    },
];

/* sign in */
exports.signin_get = function (req, res, next) {
    res.json('signin_get');
};

exports.signin_post = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ msg: 'login failed' });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            } else {
                //console.log(user._id);
                const refreshToken = jwt.sign(
                    { id: user._id },
                    process.env.REFRESH_TOKEN_KEY,
                    { expiresIn: +process.env.REFRESH_TOKEN_TIME }
                );
                const accessToken = jwt.sign(
                    { id: user._id },
                    process.env.ACCESS_TOKEN_KEY,
                    { expiresIn: +process.env.ACCESS_TOKEN_TIME }
                );
                refreshTokenList[refreshToken] = user._id;
                return res
                    .cookie('refreshToken', refreshToken, {
                        Secure: true,
                        HttpOnly: true,
                        SameSite: 'Lax',
                    })
                    .status(200)
                    .json({ accessToken: accessToken });
            }
        });
    })(req, res, next);
};
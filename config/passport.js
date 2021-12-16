const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
require('dotenv').config();

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        function (email, password, cb) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return User.findOne({ email, password })
                .then((user) => {
                    if (!user) {
                        return cb(null, false, {
                            message: 'Incorrect email or password.',
                        });
                    }
                    return cb(null, user, {
                        message: 'Logged In Successfully',
                    });
                })
                .catch((err) => cb(err));
        }
    )
);

// app.js will pass the global passport object here, and this function will configure it
// The JWT payload is passed into the verify callback
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.ACCESS_TOKEN_KEY,
        },
        function (jwt_payload, done) {
            //console.log(jwt_payload);

            return null, jwt_payload;
        }
    )
);

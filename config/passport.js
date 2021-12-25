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
        function (email, password, done) {
            //console.log('log in with: ' + email + ':' + password);
            return User.findOne({ Email: email }, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username' });
                }
                bcrypt.compare(password, user.Password, (err, res) => {
                    if (res) {
                        // passwords match! log user in

                        return done(null, user);
                    } else {
                        // passwords do not match!
                        return done(null, false, {
                            message: 'Incorrect password',
                        });
                    }
                });
            });
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

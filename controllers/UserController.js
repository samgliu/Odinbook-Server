const User = require('../models/user');
const Post = require('../models/post');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const refreshTokenList = {};
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const profilePostsList = {};
const {
    extractProfilePost,
    sortPosts,
    returnPagePosts,
} = require('../lib/postsProcess');

function getNewAccessToken(id) {
    return jwt.sign(
        { id: id },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: +process.env.ACCESS_TOKEN_TIME,
        },
        {
            algorithms: ['sha1', 'RS256', 'HS256'],
        }
    );
}

/* index_get */
exports.index_get = async (req, res, next) => {
    //console.log(req.decoded);
    const userData = await User.findById(req.decoded.id)
        .populate({
            path: 'Friends',
            //populate: { path: 'Posts' },
            select: '-Password -Friends -FriendRequests',
        })
        .populate('FriendRequests', '-Password -Friends -FriendRequests');
    //.populate('Posts');
    res.json(userData);
};

/* refreshNewAccessToken_get */
exports.refreshNewAccessToken_get = (req, res, next) => {
    try {
        /*
        const rToken = req.refreshToken;
        console.log(rToken);
        const decoded = jwt.verify(rToken, process.env.REFRESH_TOKEN_KEY);
        console.log(decoded);*/
        const decoded = req.decoded;
        const newToken = getNewAccessToken(decoded.id);
        res.json({ accessToken: newToken });
    } catch (err) {
        //console.log(err);
        res.status(401).json({ msg: 'Invalid refresh token' });
    }
};

/* profile_get */
exports.profile_get = async (req, res, next) => {
    //console.log(req.decoded);
    const userProfileData = await User.findOne({
        Username: req.params.username,
    })
        .populate({
            path: 'receivedPosts',
            populate: [
                {
                    path: 'Author',
                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                },
                {
                    path: 'Comments',
                    populate: [
                        {
                            path: 'Author',
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                        },
                        {
                            path: 'Likes',
                        },
                    ],
                },
                {
                    path: 'Likes',
                },
            ],
            select: '-Password -Friends -FriendRequests',
        })
        .populate({
            path: 'Posts',
            populate: [
                {
                    path: 'Author',
                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                },
                {
                    path: 'Comments',
                    populate: [
                        {
                            path: 'Author',
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                        },
                        {
                            path: 'Likes',
                        },
                    ],
                },
                {
                    path: 'Likes',
                },
            ],
            select: '-Password -Friends -FriendRequests',
        })
        .populate('Friends', '-Password -Friends -FriendRequests');
    //.populate('Posts');
    //console.log(userProfileData);
    res.json(userProfileData);
};

//page_profile_get
exports.page_profile_get = async (req, res, next) => {
    //console.log(req.decoded);
    try {
        const userProfileData = await User.findOne({
            Username: req.params.username,
        })
            .populate({
                path: 'receivedPosts',
                populate: [
                    {
                        path: 'Author',
                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                    },
                    {
                        path: 'Comments',
                        populate: [
                            {
                                path: 'Author',
                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                            },
                            {
                                path: 'Likes',
                            },
                        ],
                    },
                    {
                        path: 'Likes',
                    },
                ],
                select: '-Password -Friends -FriendRequests',
            })
            .populate({
                path: 'Posts',
                populate: [
                    {
                        path: 'Author',
                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                    },
                    {
                        path: 'Comments',
                        populate: [
                            {
                                path: 'Author',
                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                            },
                            {
                                path: 'Likes',
                            },
                        ],
                    },
                    {
                        path: 'Likes',
                    },
                ],
                select: '-Password -Friends -FriendRequests',
            })
            .populate('Friends', '-Password -Friends -FriendRequests');
        if (
            req.query.page == 1 ||
            !profilePostsList[req._id + userProfileData._id]
        ) {
            const returnList = await extractProfilePost(
                req.user._id,
                userProfileData
            );
            const sortedList = await sortPosts(returnList);
            profilePostsList[req._id + userProfileData._id] = sortedList;
            const returnData = await returnPagePosts(
                sortedList,
                req.query.page,
                req.query.limit
            );
            res.json(returnData);
        } else {
            const returnList = profilePostsList[req._id + userProfileData._id];
            const returnData = await returnPagePosts(
                returnList,
                req.query.page,
                req.query.limit
            );
            res.json(returnData);
        }
    } catch (err) {
        console.log(err);
        res.status(404).json('Invalid request.');
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
                console.log(err);
                return next(err);
            } else {
                //console.log(user._id);
                const refreshToken = jwt.sign(
                    { id: user._id },
                    process.env.REFRESH_TOKEN_KEY,
                    { expiresIn: +process.env.REFRESH_TOKEN_TIME },
                    { algorithms: ['sha1', 'RS256', 'HS256'] }
                );
                const accessToken = jwt.sign(
                    { id: user._id },
                    process.env.ACCESS_TOKEN_KEY,
                    { expiresIn: +process.env.ACCESS_TOKEN_TIME },
                    { algorithms: ['sha1', 'RS256', 'HS256'] }
                );
                refreshTokenList[refreshToken] = user._id;
                return res
                    .cookie('refreshToken', refreshToken, {
                        secure: true,
                        httpOnly: true,
                        sameSite: 'None',
                    })
                    .status(200)
                    .json({
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        user: user,
                    });
            }
        });
    })(req, res, next);
};

exports.logout_get = (req, res) => {
    const logoutToken = jwt.sign(
        { id: '' },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: -1,
        },
        { algorithms: ['sha1', 'RS256', 'HS256'] }
    );
    res.cookie('refreshToken', logoutToken, {
        Secure: true,
        HttpOnly: true,
        SameSite: 'None',
    })
        .status(200)
        .json('cookie cleared');
};

exports.friend_request_get = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const filter = { _id: req.params.tid };
        const update = { FriendRequests: currentUser };
        const newUser = await User.findOneAndUpdate(filter, update, {
            returnOriginal: false,
        });
        res.status(200).json({ msg: 'success' });
    } catch (err) {
        res.status(400).json({ msg: 'error' });
    }
};

exports.unfriend_get = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const filter = { _id: req.params.tid };
        const update = { $pull: { Friends: req.user._id } };
        const targetUser = await User.findOneAndUpdate(filter, update, {
            returnOriginal: false,
        });
        // update this user Friends list
        const thisFilter = { _id: req.user._id };
        const thisUpdate = { $pull: { Friends: req.params.tid } };
        const thisUser = await User.findOneAndUpdate(thisFilter, thisUpdate, {
            returnOriginal: false,
        });
        res.status(200).json({ msg: 'success' });
    } catch (err) {
        res.status(400).json({ msg: 'error' });
    }
};

exports.friend_accept_get = async (req, res, next) => {
    try {
        const targetUser = await User.findOneAndUpdate(
            { _id: req.params.tid },
            { $push: { Friends: req.user } },
            { returnOriginal: false }
        );
        const currentfilter = { _id: req.user.id };
        const currentUpdate = {
            $pull: { FriendRequests: req.params.tid },
            $push: { Friends: targetUser },
        };
        const currentUser = await User.findOneAndUpdate(
            currentfilter,
            currentUpdate,
            {
                returnOriginal: false,
            }
        );
        res.status(200).json({ msg: 'success', user: targetUser });
    } catch (err) {
        res.status(400).json({ msg: 'error' });
    }
};

exports.friend_reject_get = async (req, res, next) => {
    try {
        const currentfilter = { _id: req.user.id };
        const currentUpdate = {
            $pull: { FriendRequests: req.params.tid },
        };
        const currentUser = await User.findOneAndUpdate(
            currentfilter,
            currentUpdate,
            {
                returnOriginal: false,
            }
        );
        res.status(200).json({ msg: 'success' });
    } catch (err) {
        res.status(400).json({ msg: 'error' });
    }
};

exports.user_search_get = [
    // Validate and sanitize the name field.
    check('searchKey', 'searchKey required')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    async (req, res, next) => {
        console.log(req.query.searchKey);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            res.status(500).json({ msg: 'validation error' });
        } else {
            const searchKey = req.query.searchKey;
            const userData = await User.find(
                { Username: { $regex: `${searchKey}`, $options: 'i' } },
                (err, docs) => {
                    if (err) {
                        res.status(404).json(err);
                    } else {
                        res.status(200).json(docs);
                    }
                }
            ).clone();
        }
    },
];

exports.update_put = [
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
                if (Boolean(user) && String(user._id) != String(req.user._id)) {
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
                if (Boolean(user) && String(user._id) != String(req.user._id)) {
                    reject(new Error('E-mail already in use'));
                }
                resolve(true);
            });
        });
    }),
    body('password', 'Password required').escape(),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match! Try again.');
        }
        return true;
    }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json(errors);
        } else {
            if (req.user == undefined) {
                // res.status(401).json({ msg: 'unauthorized' });
            }

            bcrypt.hash(req.body.password, 8, async (err, hashedPassword) => {
                // if err, do something
                // otherwise, store hashedPassword in DB
                if (err) {
                    res.status(500).json({ msg: 'error' });
                }
                const avatar = req.body.avatar
                    ? req.body.avatar
                    : req.user.Avatar;
                if (req.body.password) {
                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        {
                            $set: {
                                Firstname: req.body.firstname,
                                Lastname: req.body.lastname,
                                Username: req.body.username,
                                Password: hashedPassword,
                                Email: req.body.email,
                                Avatar: avatar,
                            },
                        },
                        (err, data) => {
                            if (err) {
                                //omit
                            } else {
                                res.status(200).json(data); // success
                            }
                        }
                    );
                } else {
                    User.findOneAndUpdate(
                        { _id: req.user._id },
                        {
                            $set: {
                                Firstname: req.body.firstname,
                                Lastname: req.body.lastname,
                                Username: req.body.username,
                                Email: req.body.email,
                                Avatar: avatar,
                            },
                        },
                        (err, data) => {
                            if (err) {
                                //omit
                            } else {
                                res.status(200).json(data); // success
                            }
                        }
                    );
                }
            });
        }
    },
];

/*
//FIXME haven't test
exports.upload_post = async (req, res, next) => {
    console.log(req.files);
    try {
        if (!req.files) {
            //req.files
            res.send({
                status: false,
                message: 'No file uploaded',
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            let fileName = uuidv4() + avatar.name;
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('../public/uploads/' + fileName);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: fileName,
                    mimetype: avatar.mimetype,
                    size: avatar.size,
                },
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
*/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName);
    },
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
});

// User model
exports.upload_post = [
    upload.single('picture'),
    async (req, res, next) => {
        try {
            upload.single('picture');
            //const url = 'http://' + req.get('host') + '/images/'; //FIXMEmaybe need adjustment
            const url = '/images/';
            req.img = url + req.file.filename;
            //res.status(200).send(req.img);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
        return next();
    },
];

exports.upload_avatar_post = (req, res, next) => {
    try {
        //const url = 'http://' + req.get('host') + '/images/'; //FIXMEmaybe need adjustment
        User.findOneAndUpdate(
            { _id: req.user._id },
            {
                $set: {
                    Avatar: req.img,
                },
            },
            (err, data) => {
                if (err) {
                    //omit
                } else {
                    res.status(200).json(req.img); // success
                }
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.upload_posts_post = (req, res, next) => {
    try {
        res.status(200).json(req.img); // success
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

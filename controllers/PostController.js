const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const refreshTokenList = {};
require('dotenv').config();

/* create new */
exports.create_post_get = function (req, res, next) {
    res.json('create_post_get');
};

exports.create_post_post = [
    // Validate and sanitize the name field.
    body('content', 'Content required').isLength({ min: 1 }).escape(),
    body('picture').escape(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(500).json({ msg: 'error' });
        } else {
            try {
                //user = await User.findOne({ _id: req.decoded.id });
                //if (user == undefined) {
                //    console.log('unauthorized');
                //res.status(401).json({ msg: 'unauthorized' });
                //}
                const picture = req.body.picture ? req.body.picture : '';
                const post = new Post({
                    Content: req.body.content,
                    Author: req.user,
                    Picture: picture,
                    Timestamp: new Date(),
                    Comments: [],
                }).save(async (err, rest) => {
                    if (err) {
                        res.status(500).json({ msg: 'error' });
                    } else {
                        const newUser = await User.findOneAndUpdate(
                            { _id: req.user.id },
                            { $push: { Posts: rest } },
                            { returnOriginal: false }
                        ).populate('Posts');
                        res.status(200).json(newUser);
                    }
                });
            } catch (err) {
                res.status(401).send('Invalid Token');
            }
        }
    },
];

/* get single post */
exports.post_get = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('Author')
            .populate('Comments')
            .populate('Likes')
            .sort({ Timestamp: -1 });
        res.json(post);
    } catch (err) {
        res.status(404).json({ msg: 'Not Found' });
    }
};

/* get delete */
exports.post_delete = async (req, res, next) => {
    console.log(req.user);
    if (req.user) {
        const newPosts = await Post.deleteOne({ _id: req.params.id })
            .then(function (err, results) {
                Comment.deleteMany({ Post: req.params.id }).exec();
                res.status(200).json({ msg: 'delete successfully' }); // Success
            })
            .catch(function (error) {
                res.status(500).json({ msg: 'error' });
            });
    } else {
        res.status(401).json({ msg: 'unauthorized' });
    }
};

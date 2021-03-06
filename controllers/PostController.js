const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const refreshTokenList = {};
const postsList = {};
const {
    extractPost,
    sortPosts,
    returnPagePosts,
} = require('../lib/postsProcess');
require('dotenv').config();

/* userself posts get */
exports.posts_get = async (req, res, next) => {
    const userData = await User.findById(req.decoded.id)
        .populate({
            path: 'Friends',
            populate: {
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
                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                            },
                            {
                                path: 'Post',
                                populate: [
                                    {
                                        path: 'Author',
                                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                    },
                                ],
                                select: 'Author',
                            },
                        ],
                    },
                    {
                        path: 'Likes',
                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                    },
                ],
                select: '-Password -Friends -FriendRequests',
            },
            select: '-Password -Friends -FriendRequests',
        })
        .populate('FriendRequests', '-Password -Friends -FriendRequests')
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
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                        },
                        {
                            path: 'Post',
                            populate: [
                                {
                                    path: 'Author',
                                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                },
                            ],
                            select: 'Author',
                        },
                    ],
                },
                {
                    path: 'Likes',
                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
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
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                        },
                        {
                            path: 'Post',
                            populate: [
                                {
                                    path: 'Author',
                                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                },
                            ],
                            select: 'Author',
                        },
                    ],
                },
                {
                    path: 'Likes',
                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                },
            ],

            select: '-Password -Friends -FriendRequests',
        });
    res.json(userData);
};

/* userself page posts get */
exports.page_posts_get = async (req, res, next) => {
    try {
        if (req.query.page == 1 || !postsList[req._id]) {
            const userData = await User.findById(req.decoded.id)
                .populate({
                    path: 'Friends',
                    populate: {
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
                                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                    },
                                    {
                                        path: 'Post',
                                        populate: [
                                            {
                                                path: 'Author',
                                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                            },
                                        ],
                                        select: 'Author',
                                    },
                                ],
                            },
                            {
                                path: 'Likes',
                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                            },
                        ],
                        select: '-Password -Friends -FriendRequests',
                    },
                    select: '-Password -Friends -FriendRequests',
                })
                .populate(
                    'FriendRequests',
                    '-Password -Friends -FriendRequests'
                )
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
                                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                },
                                {
                                    path: 'Post',
                                    populate: [
                                        {
                                            path: 'Author',
                                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                        },
                                    ],
                                    select: 'Author',
                                },
                            ],
                        },
                        {
                            path: 'Likes',
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
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
                                    select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                },
                                {
                                    path: 'Post',
                                    populate: [
                                        {
                                            path: 'Author',
                                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                        },
                                    ],
                                    select: 'Author',
                                },
                            ],
                        },
                        {
                            path: 'Likes',
                            select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                        },
                    ],

                    select: '-Password -Friends -FriendRequests',
                });
            const returnList = await extractPost(req.user._id, userData);
            const sortedList = await sortPosts(returnList);
            postsList[req._id] = sortedList;
            const returnData = await returnPagePosts(
                sortedList,
                req.query.page,
                req.query.limit
            );
            res.json(returnData);
        } else {
            const returnList = postsList[req._id];
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

/* create new */
exports.create_post_get = function (req, res, next) {
    res.json('create_post_get');
};

/* create post under userself */
exports.create_post_self_post = [
    // Validate and sanitize the name field.
    body('content', 'Content required').trim().isLength({ min: 1 }),
    body('content', 'Max length exceeded').trim().isLength({ max: 1000 }),
    body('picture'),

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
                let picture = '';
                if (req.body.picture) {
                    picture = req.body.picture.replaceAll('&#x2F;', '/');
                }
                console.log(picture);
                const post = new Post({
                    Content: req.body.content,
                    Author: req.user,
                    TargetUser: req.user,
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
                        console.log(rest);
                        res.status(200).json(rest);
                    }
                });
            } catch (err) {
                res.status(401).send('Invalid Token');
            }
        }
    },
];

/* create post under target user */
exports.create_post_post = [
    // Validate and sanitize the name field.
    check('targetUsername', 'Target Username required')
        .isLength({ min: 1 })
        .escape(),
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
                const target = await User.findOne({
                    Username: req.params.targetUsername,
                });
                let picture = '';
                if (req.body.picture) {
                    picture = req.body.picture.replaceAll('&#x2F;', '/');
                }
                const post = new Post({
                    Content: req.body.content,
                    Author: req.user,
                    TargetUser: target,
                    Picture: picture,
                    Timestamp: new Date(),
                    Comments: [],
                }).save(async (err, rest) => {
                    if (err) {
                        res.status(500).json({ msg: 'error' });
                    } else {
                        /* // update self posts
                        const newUser = await User.findOneAndUpdate(
                            { _id: req.user.id },
                            { $push: { Posts: rest } },
                            { returnOriginal: false }
                        ).populate('Posts');*/
                        const newTargetUser = await User.findOneAndUpdate(
                            { Username: req.params.targetUsername },
                            { $push: { receivedPosts: rest } },
                            { returnOriginal: false }
                        ).populate('Posts');

                        res.status(200).json(rest);
                    }
                });
            } catch (err) {
                res.status(401).send('Invalid Token');
            }
        }
    },
];

/* get single post
exports.post_get = async (req, res, next) => {
    try {
        console.log(req.params.id);
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
 */

/* verify homepage single post auth*/
exports.post_auth_get = async (req, res, next) => {
    try {
        res.status(200).json('authorized');
    } catch (err) {
        res.status(404).json({ msg: 'Not Found' });
    }
};

/* get delete */
exports.post_delete = async (req, res, next) => {
    //console.log(req.user);
    if (req.isOwner) {
        const filter = { _id: req.user.id };
        const update = { $pull: { Posts: req.params.id } };
        const newUser = await User.findOneAndUpdate(filter, update, {
            returnOriginal: false,
        });
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

/* post put like */
exports.like_get = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const filter = { _id: req.params.id };
        const update = { $push: { Likes: currentUser } };
        const newPost = await Post.findOneAndUpdate(filter, update, {
            returnOriginal: false,
        });
        //console.log(newPost);
        res.status(200).json({ msg: 'success' });
    } catch (err) {
        res.status(400).json({ msg: 'error' });
    }
};

/* put unlike */
exports.unlike_get = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const filter = { _id: req.params.id };
        const update = { $pull: { Likes: req.user.id } };
        try {
            const newPost = await Post.findOneAndUpdate(filter, update, {
                returnOriginal: false,
            });
            //console.log(newPost);
            res.status(200).json({ msg: 'success' });
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        //console.log(err);
        res.status(400).json({ msg: 'error' });
    }
};

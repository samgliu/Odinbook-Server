const User = require('../models/user');
const Post = require('../models/post');
const Room = require('../models/room');
const Message = require('../models/message');
const { body, check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const refreshTokenList = {};
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function getRoomHistory(roomId) {
    const filter = { RoomId: roomId };
    const res = Message.find(filter);
    return res;
}

/* using sender and receiver id to get room id or create new room if there isn't one*/
exports.room_post = [
    // Validate and sanitize the name field.
    body('receiverId', 'receiverId required').isLength({ min: 10 }).escape(),
    body('senderId', 'senderId required').isLength({ min: 10 }).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(500).json({ msg: 'error' });
        } else {
            try {
                const targetUser = await User.findOne({
                    _id: req.body.receiverId,
                });

                Room.findOne({
                    Members: {
                        $all: [req.user._id, targetUser._id],
                    },
                })
                    .populate({
                        path: 'Members',
                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                    })
                    .then(async (rest, err) => {
                        if (rest && rest._id) {
                            const data = await getRoomHistory(rest._id);
                            res.status(200).send({
                                room: rest,
                                history: data,
                            });
                        } else {
                            const newRoom = new Room({
                                Members: [req.user, targetUser],
                                Timestamp: new Date(),
                            });
                            const nr = await newRoom.save(
                                async (err, result) => {
                                    if (err) {
                                        res.status(500).json({ msg: 'error' });
                                    } else {
                                        const returnData =
                                            await result.populate({
                                                path: 'Members',
                                                select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                                            });
                                        const data = await getRoomHistory(
                                            returnData._id
                                        );
                                        res.status(200).send({
                                            room: returnData,
                                            history: data,
                                        });
                                    }
                                }
                            );
                        }
                    });
            } catch (err) {
                console.log(err);
                res.status(401).send('Invalid Token');
            }
        }
    },
];

exports.message_post = [
    // Validate and sanitize the name field.
    body('receiverId', 'receiverId required').isLength({ min: 10 }).escape(),
    body('senderId', 'senderId required').isLength({ min: 10 }).escape(),
    body('text', 'Text required').isLength({ min: 1 }).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            res.status(500).json({ msg: 'error' });
        } else {
            try {
                const targetUser = await User.findOne({
                    _id: req.body.receiverId,
                });

                Room.findOne({
                    Members: {
                        $all: [req.user._id, targetUser._id],
                    },
                })
                    .populate({
                        path: 'Members',
                        select: '-Password -Friends -FriendRequests -Posts -receivedPosts',
                    })
                    .then(async (rest, err) => {
                        if (rest && rest._id) {
                            const msg = new Message({
                                Text: req.body.text,
                                SendBy: req.user,
                                RoomId: rest,
                                Timestamp: new Date(),
                            }).save((err, rest) => {
                                Room.findOneAndUpdate(
                                    { Members: [req.user._id, targetUser._id] },
                                    {
                                        $set: {
                                            LastMessage: rest,
                                        },
                                    },
                                    (err, data) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(
                                                'success update room last message'
                                            );
                                        }
                                    }
                                );
                            });
                            res.status(200).send('success');
                        } else {
                            res.status(400).send('Invalid Members');
                        }
                    });
            } catch (err) {
                console.log(err);
                res.status(401).send('Invalid Token');
            }
        }
    },
];

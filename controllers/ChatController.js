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

/* using sender and receiver id to get room id or create new room if there isn't one*/
exports.room_post = async (req, res, next) => {
    console.log(req.senderId);
    console.log(req.receiverId);
    const filter = { Members: [req.senderId, req.receiverId] };
    Room.findAll(filter).then((err, rest)=>{
        if (err){
            const post = new Room({
                Members: [req.senderId, req.receiverId],
                Timestamp: new Date();
            }).save(async (err, result)=>{
                if (err){
                    res.status(500).json({ msg: 'error' });
                } else {
                    res.status(200).json(result);
                }
            })
        } else {
            res.status(200).json(result);
        }
    })
};

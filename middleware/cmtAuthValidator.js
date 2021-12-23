const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.cmtAuthValidator = async (req, res, next) => {
    const uid = req.user._id;
    const pid = req.params.id;
    const cid = req.params.cid;
    try {
        const post = await Post.findOne({ _id: pid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id
        if (String(uid) != String(post.Author._id)) {
            //return res.status(404).send('not owner');
            throw new Error('not auth');
        }
        const cmt = await Comment.findOne({ _id: cid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id
        if (String(uid) != String(cmt.Author._id)) {
            //return res.status(404).send('not owner');
            throw new Error('not auth');
        }
    } catch (err) {
        //console.log(err);
        return res.status(404).json('error');
    }
    req.isAuth = true;
    return next();
};

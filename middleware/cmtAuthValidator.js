const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.cmtAuthValidator = async (req, res, next) => {
    const uid = req.user._id;
    const pid = req.params.id;
    const cid = req.params.cid;
    let isPoster = false;
    let isAuthor = false;
    try {
        const post = await Post.findOne({ _id: pid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id

        if (String(uid) === String(post.Author._id)) {
            //return res.status(404).send('not owner');
            //console.log('is poster');
            isPoster = true;
        }
        const cmt = await Comment.findOne({ _id: cid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id
        //console.log(String(uid));
        //console.log(String(cmt.Author._id));
        if (String(uid) === String(cmt.Author._id)) {
            //console.log('is author');
            isAuthor = true;
            //return res.status(404).send('not owner');
        }
        if (!isPoster && !isAuthor) {
            throw new Error('Not authorized');
        }
    } catch (err) {
        //console.log(err);
        return res.status(404).json('errors');
    }
    req.isAuth = isPoster || isAuthor;
    return next();
};

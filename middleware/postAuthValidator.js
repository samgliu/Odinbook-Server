const Post = require('../models/post');
const User = require('../models/user');

exports.postAuthValidator = async (req, res, next) => {
    const id = req.user._id;
    const pid = req.params.id;
    try {
        const post = await Post.findOne({ _id: pid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id
        if (String(id) != String(post.Author._id)) {
            //return res.status(404).send('not owner');
            throw new Error('not owner');
        }
    } catch (err) {
        //console.log(err);
        return res.status(401).json('Not authorized');
    }
    req.isOwner = true;
    return next();
};

exports.profilePostAuthValidator = async (req, res, next) => {
    const id = req.user._id;
    const pid = req.params.id;
    //const isAuth = false;
    try {
        const post = await Post.findOne({ _id: pid }).populate(
            'Author',
            '-Password'
        );
        // use String() to compare id
        if (
            String(id) != String(post.Author._id) &&
            String(req.targetUser._id) != String(id)
        ) {
            //return res.status(404).send('not owner');
            throw new Error('not auth');
        }
    } catch (err) {
        //console.log(err);
        return res.status(401).json('Not authorized');
    }
    req.isOwner = true;
    return next();
};

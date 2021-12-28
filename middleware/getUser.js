const User = require('../models/user');

exports.getUser = async (req, res, next) => {
    const id = req.decoded.id;

    try {
        const user = await User.findOne({ _id: req.decoded.id })
            .populate('Friends')
            .populate('FriendRequests')
            .populate('Posts');
        req.user = user;
    } catch (err) {
        console.log(err);
        return res.status(404).send('not found');
    }
    return next();
};

exports.getTargetUser = async (req, res, next) => {
    const username = req.params.username;

    try {
        const userProfileData = await User.findOne({
            Username: username,
        });
        req.targetUser = userProfileData;
    } catch (err) {
        return res.status(404).send('not found');
    }
    return next();
};

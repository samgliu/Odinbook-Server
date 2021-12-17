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
        return res.status(404).send('not found');
    }
    return next();
};

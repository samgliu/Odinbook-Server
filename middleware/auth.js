const jwt = require('jsonwebtoken');
require('dotenv').config();

// refreshTokenList

exports.verifyToken = (req, res, next) => {
    const accessToken =
        req.body.accessToken ||
        req.query.accessToken ||
        req.headers['x-access-token'];

    if (!accessToken) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        req.decoded = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
};

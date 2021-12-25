const jwt = require('jsonwebtoken');
require('dotenv').config();

// refreshTokenList

exports.refreshTokenAuth = async (req, res, next) => {
    const refreshToken =
        req.body.refreshToken ||
        req.query.refreshToken ||
        req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_KEY,
            { algorithms: ['sha1', 'RS256', 'HS256'] }
        );
        req.decoded = decoded;
    } catch (err) {
        console.log(err);
        return res.status(401).send('Invalid Token');
    }
    return next();
};

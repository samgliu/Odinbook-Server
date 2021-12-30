const jwt = require('jsonwebtoken');
require('dotenv').config();

// refreshTokenList

exports.verifyToken = (req, res, next) => {
    const accessToken =
        req.body.accessToken ||
        req.query.accessToken ||
        req.headers['x-access-token'];
    //console.log('accessToken in verify Token');
    //console.log(accessToken);
    if (!accessToken) {
        return res
            .status(403)
            .send('Verification fail! A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, {
            algorithms: ['sha1', 'RS256', 'HS256'],
        });
        console.log(decoded);
        req.decoded = decoded;
    } catch (err) {
        console.log(err);
        return res.status(401).send('Invalid Token');
    }
    return next();
};

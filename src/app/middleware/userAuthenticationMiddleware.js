const { verifyJwt } = require('../../config/authConfig');
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

const userAuthenticationMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader && authHeader.split(' ')[1];

        const verifyToken = verifyJwt(accessToken, accessTokenSecretKey);

        if (!authHeader || !verifyJwt(accessToken, accessTokenSecretKey)) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        req.user = verifyToken;
        return next();
    } catch (error) {
        return res.json({ error });
    }
};

module.exports = userAuthenticationMiddleware;

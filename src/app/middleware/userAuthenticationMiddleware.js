const { verifyJwt } = require('../../config/authConfig');

const userAuthenticationMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader && authHeader.split(' ')[1];

        const verifyToken = verifyJwt(accessToken);

        if (!authHeader || !verifyJwt(accessToken)) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        req.user = verifyToken;
        return next();
    } catch (error) {
        return res.json({ error });
    }
};

module.exports = userAuthenticationMiddleware;

const { verifyJwt } = require('../../config/authConfig');

const userAuthenticationMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader && authHeader.split(' ')[1];
        if (!authHeader || !verifyJwt(accessToken)) {
            return res.json({ error: 'unauthorized' });
        }

        return next();
    } catch (error) {
        return res.json({ error });
    }
};

module.exports = userAuthenticationMiddleware;

require('dotenv').config();
var jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;

const signJwtAccessToken = (payload) => {
    const token = jwt.sign(payload, secret_key, { expiresIn: '1h' });
    return token;
};

const verifyJwt = (token) => {
    try {
        const decode = jwt.verify(token, secret_key);
        return decode;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = { signJwtAccessToken, verifyJwt };

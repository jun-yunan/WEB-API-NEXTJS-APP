require('dotenv').config();
var jwt = require('jsonwebtoken');
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, accessTokenSecretKey, { expiresIn: '10s' });
    return accessToken;
};

const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, refreshTokenSecretKey, { expiresIn: '365d' });
    return refreshToken;
};

const verifyJwt = (token, secretKey) => {
    try {
        const decode = jwt.verify(token, secretKey);
        return decode;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = { generateAccessToken, verifyJwt, generateRefreshToken };

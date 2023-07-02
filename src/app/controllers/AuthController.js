const { generateAccessToken, generateRefreshToken, verifyJwt } = require('../../config/authConfig');
const User = require('../models/UserSchema');
const RefreshToken = require('../models/RefreshTokenSchema');
const bcrypt = require('bcrypt');
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

class AuthController {
    async login(req, res, next) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required!!!' });
        }

        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) return res.status(404).json({ message: 'Not found user!!!' });
            const passwordMatch = await bcrypt.compare(req.body.password, user.password);
            if (!passwordMatch) return res.status(403).json({ message: 'Wrong password!!!' });

            const {
                password,
                introduce,
                posts,
                username,
                image,
                refreshToken: userRefreshToken,
                ...otherUser
            } = user._doc;

            const accessToken = generateAccessToken({ _id: otherUser._id });
            const refreshToken = generateRefreshToken({ _id: otherUser._id });

            await User.findByIdAndUpdate(
                otherUser._id,
                {
                    $set: { refreshToken },
                },
                { new: true },
            ).lean();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            });
            res.status(200).json({ ...otherUser, accessToken, refreshToken });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    test(req, res) {
        return res.json({ message: 'successfdsfsfd', data: req.body });
    }

    //[POST] /auth/refresh-token
    async refreshToken(req, res, next) {
        // const refreshToken = req.cookies.refreshToken;
        const { userId, refreshToken } = req.body;
        if (!refreshToken || !userId) {
            return res
                .status(400)
                .json({ message: 'refreshToken and userId are required!!!', body: req.body });
        }

        try {
            const user = await User.findById(userId).lean();

            if (!user) {
                return res.status(404).json({ message: 'user not found!!!' });
            }

            const {
                password,
                introduce,
                posts,
                username,
                image,
                refreshToken: userRefreshToken,
                ...otherUser
            } = user;

            const decode = verifyJwt(refreshToken, refreshTokenSecretKey);

            if (!decode) {
                return res.status(403).json({ message: 'Authentication failed' });
            }

            const newAccessToken = generateAccessToken({ _id: otherUser._id });
            const newRefreshToken = generateRefreshToken({ _id: otherUser._id });

            const updateRefreshToken = await User.findByIdAndUpdate(
                userId,
                { $set: { refreshToken: newRefreshToken } },
                { returnDocument: 'after' },
            ).lean();

            return res.status(200).json({
                newAccessToken,
                newRefreshToken,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();

const User = require('../models/UserSchema');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { signJwtAccessToken } = require('../../config/authConfig');
const cloudinary = require('../../helper/imageUpload');
const multer = require('multer');

// const cloudinary = require('cloudinary');

class UserController {
    //[GET] getAllUser
    async getAllUser(req, res, next) {
        try {
            const user = await User.find({});

            if (!user) return;

            return res.json({ message: 'Successfully!!!', status: true, user });
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                for (let field in error.errors) {
                    const msg = error.errors[field].message;
                    return res.json({
                        error: msg,
                        message: 'Create account fail!!!',
                        status: false,
                    });
                }
            }
            return res.json({
                message: 'Fail!!!',
                status: false,
                error: { message: error.message, stack: error.stack },
            });
        }
    }

    //[POST] signup

    async signup(req, res, next) {
        try {
            if (!req.body) return res.status(400).json({ error: 'Data is missing' });

            const { email, name, password } = req.body.data || req.body;

            const userExists = await User.exists({ email });

            if (userExists) return res.json({ error: 'User Already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                email,
                name,
                password: hashedPassword,
                birthDay: '',
                avatar: '',
                // image: '',
                address: '',
                gender: '',
                username: '',
                // date: '',
                numberPhone: '',
            });
            if (!user) return res.json({ error: 'Create account fail' });

            return res.json({
                email: user.email,
                name: user.name,
                message: 'Create account successfully!!!',
                status: true,
            });
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                for (let field in error.errors) {
                    const msg = error.errors[field].message;
                    return res.json({
                        error: msg,
                        message: 'Create account fail!!!',
                        status: false,
                    });
                }
            }
            return res.json({
                message: 'Create account fail!!!',
                status: false,
                error: { message: error.message, stack: error.stack },
                request: req.body,
            });
        }
    }

    //[POST] signIn
    async login(req, res, next) {
        try {
            if (!req.body) return res.json({ error: 'Data is missing', status: false });

            const user = await User.findOne({ email: req.body.email });
            if (!user) return res.json({ error: 'User email not found', status: false });

            const passwordMatch = await bcrypt.compare(req.body.password, user.password);
            if (!passwordMatch) return res.json({ error: 'Password incorrect', status: false });

            const { password, ...infoOther } = user;

            const accessToken = signJwtAccessToken({
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            });

            if (!accessToken) return res.json({ error: 'Error access token generation', status: false });

            return res.json({
                status: true,
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                address: user.address,
                numberPhone: user.numberPhone,
                gender: user.gender,
                birthDay: user.birthDay,
                accessToken,
            });
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                for (let field in error.errors) {
                    const msg = error.errors[field].message;
                    return res.json({
                        error: msg,
                        message: 'Find account fail!!!',
                        status: false,
                    });
                }
            }
            return res.json({ error: { message: error.message, stack: error.stack }, status: false });
        }
    }

    //[GET] /user/:id
    async getUserById(req, res, next) {
        try {
            const { _id } = req.params;

            if (!_id) return res.json({ error: 'not found userId' });
            const user = await User.findById(_id)
                .select('name address numberPhone gender email birthDay avatar coverImage')
                .lean()
                .exec()
                .catch((error) => res.json({ error, message: 'not found user!!!', status: false }));

            return res.json({ message: 'find user by id successfully!!!', status: true, user });
        } catch (error) {
            return res.status(404).json({ error: 'catch', status: false });
        }
    }

    //[POST] /user/profile/avatar
    async uploadImage(req, res, next) {
        const { _id } = req.user;

        if (!_id) return res.json({ error: 'unauthorized' });

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${_id}_avatar`,
                folder: 'avatar',
            });
            const { url: urlAvatar } = result;
            const user = await User.findByIdAndUpdate(
                _id,
                { $set: { avatar: urlAvatar } },
                { returnDocument: 'after' },
            )
                .lean()
                .exec()
                .catch((error) => res.json({ error, message: 'Update avatar fail', status: false }));
            return res.json({
                message: 'upload image successfully',
                result,
                user,
                request: req.body,
                status: true,
            });
        } catch (error) {
            return res.json({ error: { message: error.message, stack: error.stack }, message: 'catch' });
        }
    }

    //[PUT] /user/profile
    async updateInfoProfile(req, res, next) {
        const { _id } = req.user;

        const { name, birthDay, address, numberPhone, gender } = req.body;

        try {
            const user = await User.findByIdAndUpdate(
                _id,
                {
                    $set: { name, birthDay, address, numberPhone, gender },
                },
                { returnDocument: 'after' },
            );
            return res.json({ message: 'success', token: req.user, request: req.body, user });
        } catch (error) {
            console.error(error);
            res.json({ error: { message: error.message, stack: error.stack } });
        }
    }

    //[PUT] /users
    async updateUser(req, res, next) {
        res.json({ message: 'fdsfsdfdsfa', request: req.body || 'fdsfsd' });
    }

    //[POST] /users/:userId/profile/introduce

    async createIntroduce(req, res, next) {
        if (!req.body) return res.status(400).json({ error: 'Data is missing' });
        const { userId } = req.params;

        try {
            const introduce = await User.findByIdAndUpdate(
                userId,
                { $set: { introduce: req.body } },
                { returnDocument: 'after' },
            )
                .lean()
                .exec()
                .catch((error) =>
                    res.status(400).json({ error, message: 'create introduce fail!!!', status: false }),
                );
            return res.json({
                message: 'create introduce successfully!!!',
                request: req.body,
                introduce,
                status: true,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[POST] /users/:userId/profile/introduce
    async getIntroduce(req, res, next) {
        const { userId } = req.params;

        try {
            const introduce = await User.findById(userId, 'introduce')
                .lean()
                .exec()
                .catch((error) =>
                    res.status(404).json({ error, message: 'not found introduce', status: false }),
                );

            return res.status(200).json({
                ...introduce,
                message: 'get introduce successfully!!!',
                status: true,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[POST]

    async updateCoverImage(req, res, next) {
        const { userId } = req.params;
        if (!userId && !req.file) return res.status(400).json({ error: 'Data is missing' });

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${userId}_coverImage`,
                folder: 'coverImage',
            });
            if (!result) return res.status(409).json({ error: 'save cover image fail!!!' });
            const { url } = result;

            const coverImage = await User.findByIdAndUpdate(
                userId,
                { $set: { coverImage: url } },
                { returnDocument: 'after' },
            )
                .select()
                .lean()
                .exec()
                .catch((error) =>
                    res
                        .status(404)
                        .json({ error, message: 'User does not exist or save fail!!', status: false }),
                );

            return res.json({
                message: 'successfully!!!',
                request: req.file,
                userId,
                coverImage,
                status: true,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllPost(req, res, next) {
        const { userId } = req.params;

        await User.exists({ _id: userId })
            .exec()
            .catch((error) => res.status(404).json({ error, message: 'not found user!!!' }));

        try {
            const posts = await User.findById(userId).populate('posts').lean().exec();

            if (!posts) return res.status(404).json({ error: 'not found posts' });

            return res.status(200).json({ message: 'get all post successfully!!!', posts });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();

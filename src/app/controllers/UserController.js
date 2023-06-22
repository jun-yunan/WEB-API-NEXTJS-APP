const UserSchema = require('../models/UserSchema');
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
            const user = await UserSchema.find({});

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

            const userExists = await UserSchema.exists({ email });

            if (userExists) return res.json({ error: 'User Already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await UserSchema.create({
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

            const user = await UserSchema.findOne({ email: req.body.email });
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
            const user = await UserSchema.findById(_id)
                .select('name address numberPhone gender email birthDay avatar')
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
            const user = await UserSchema.findByIdAndUpdate(
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
            const user = await UserSchema.findByIdAndUpdate(
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
}

module.exports = new UserController();

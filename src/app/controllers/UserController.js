const UserSchema = require('../models/UserSchema');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { signJwtAccessToken } = require('../../config/authConfig');

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
            return res.json({ message: 'Fail!!!', status: false, error });
        }
    }

    //[POST] signup

    async signup(req, res, next) {
        try {
            if (!req.body) return res.status(400).json({ error: 'Data is missing' });

            const { email, name, password } = req.body.data;

            const userExists = await UserSchema.exists({ email });

            if (userExists) return res.json({ error: 'User Already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await UserSchema.create({
                email,
                name,
                password: hashedPassword,
                image: '',
                address: '',
                gender: '',
                username: '',
                date: '',
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
            return res.json({ message: 'Create account fail!!!', status: false, error });
        }
    }

    //[POST] signIn
    async signIn(req, res, next) {
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
            });

            if (!accessToken) return res.json({ error: 'Error access token generation', status: false });

            return res.json({
                status: true,
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: user.image,
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
            return res.json({ error, status: false });
        }
    }

    //[GET] /getUserById/:id
    getUserById(req, res, next) {
        return res.json({ message: 'fdsfsdf' });
    }
}

module.exports = new UserController();

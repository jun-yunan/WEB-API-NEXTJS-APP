const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String },
        password: { type: String },
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        gender: { type: String },
        date: { type: String },
        birthDay: { type: String },
        avatar: { type: String },
        numberPhone: { type: String },
        address: { type: String },
        introduce: {
            studying: { type: String },
            living: { type: String },
            work: { type: String },
            social: { type: String },
            interests: { type: String },
        },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        // refreshToken: {
        //     // type: mongoose.Schema.Types.ObjectId,
        //     refreshToken: { type: String },
        //     createdAt: {
        //         type: Date,
        //         default: Date.now,
        //         expires: '7d',
        //     },
        // },
        refreshToken: { type: String },

        coverImage: { type: String },
    },
    { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    identifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refreshToken: { type: String, required: true, unique: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d', // Tự động xóa RefreshToken sau 7 ngày
    },
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

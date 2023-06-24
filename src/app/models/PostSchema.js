const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema(
    {
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        image: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Post', PostSchema);

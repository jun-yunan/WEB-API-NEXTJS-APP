const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        nameProduct: { type: String },
        description: { type: String },
        price: { type: String },
        image: { type: String },
        type: { type: String },
        slug: { type: String, unique: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Product', ProductSchema);

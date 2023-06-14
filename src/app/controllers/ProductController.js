const mongoose = require('mongoose');
const ProductSchema = require('../models/ProductSchema');

class ProductController {
    async getProducts(req, res, next) {
        try {
            const { page, limit } = req.query;

            if (!req.query) return res.json({ error: 'Data is missing' });

            const skipAmount = (page - 1) * limit;

            const products = await ProductSchema.find()
                .skip(skipAmount)
                .limit(limit)
                .select('_id nameProduct description price image');

            if (!products) return res.json({ error: 'Cannot found products!!!' });

            return res.json({ page, limit, products });
        } catch (error) {
            return res.json({ error, message: 'Fail!!!' });
        }
    }
}

module.exports = new ProductController();

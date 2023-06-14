const express = require('express');
const router = express.Router();

// const productController = require('../app/controllers/ProductController');
const productController = require('../app/controllers/ProductController');
const userController = require('../app/controllers/UserController');

const userAuthenticationMiddleware = require('../app/middleware/userAuthenticationMiddleware');

//  USER
router.get(
    '/getAllUser',
    // userAuthenticationMiddleware,
    userController.getAllUser,
);
router.post('/signup', userController.signup);
router.post('/signIn', userController.signIn);
router.get('/getUser/:id', userController.getUserById);

// PRODUCT

router.get('/products', productController.getProducts);

module.exports = router;

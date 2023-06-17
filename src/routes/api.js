const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const userController = require('../app/controllers/UserController');

const userAuthenticationMiddleware = require('../app/middleware/userAuthenticationMiddleware');
const multerUploadMiddleware = require('../app/middleware/multerUploadMiddleware');

//  USER
router.get('/getAllUser', userAuthenticationMiddleware, userController.getAllUser);
router.post('/signup', userController.signup);
router.post('/signIn', userController.signIn);
router.post(
    '/users/profile/avatar',
    userAuthenticationMiddleware,
    multerUploadMiddleware.single('avatar'),
    userController.uploadImage,
);

router.put(
    '/users/profile/avatar',
    userAuthenticationMiddleware,
    multerUploadMiddleware.single('avatar'),
    userController.uploadImage,
);
router.put('/users/profile', userAuthenticationMiddleware, userController.updateInfoProfile);
router.put('/users', userAuthenticationMiddleware, userController.updateInfoProfile);
router.get('/users/:_id', userController.getUserById);

// PRODUCT
router.get('/products', productController.getProducts);

module.exports = router;

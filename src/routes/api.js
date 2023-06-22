const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const userController = require('../app/controllers/UserController');
const PostController = require('../app/controllers/PostController');

const userAuthenticationMiddleware = require('../app/middleware/userAuthenticationMiddleware');
const multerUploadMiddleware = require('../app/middleware/multerUploadMiddleware');

//  USER
router.get('/getAllUser', userAuthenticationMiddleware, userController.getAllUser);
router.post('/users/sign-up', userController.signup);
router.post('/users/sign-in', userController.login);
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

// POST

router.post(
    '/users/:_id/posts',
    userAuthenticationMiddleware,
    multerUploadMiddleware.single('image'),
    PostController.createPost,
);

router.get('/users/:_id/posts', userAuthenticationMiddleware, PostController.getPost);

router.delete('/users/:userId/posts/:postId', userAuthenticationMiddleware, PostController.deletePost);

module.exports = router;

const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const userController = require('../app/controllers/UserController');
const PostController = require('../app/controllers/PostController');

const userAuthenticationMiddleware = require('../app/middleware/userAuthenticationMiddleware');
const multerUploadMiddleware = require('../app/middleware/multerUploadMiddleware');
const UserController = require('../app/controllers/UserController');

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
router.post(
    '/users/:userId/profile/cover-image',
    userAuthenticationMiddleware,
    multerUploadMiddleware.single('coverImage'),
    UserController.updateCoverImage,
);
router.post('/users/:userId/profile/introduce', userAuthenticationMiddleware, UserController.createIntroduce);
router.get('/users/:userId/profile/introduce', userAuthenticationMiddleware, UserController.getIntroduce);

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

router.get('/users/:userId/profile/images', PostController.getImagesProfileById);
router.post(
    '/users/:_id/posts',
    userAuthenticationMiddleware,
    multerUploadMiddleware.single('image'),
    PostController.createPost,
);

router.get('/users/:_id/posts', userAuthenticationMiddleware, PostController.getPosts);

router.delete('/users/:userId/posts/:postId', userAuthenticationMiddleware, PostController.deletePost);

module.exports = router;

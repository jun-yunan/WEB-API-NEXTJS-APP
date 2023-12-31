const mongoose = require('mongoose');
const Post = require('../models/PostSchema');
const cloudinary = require('../../helper/imageUpload');
const UserSchema = require('../models/UserSchema');

class PostController {
    async createPost(req, res, next) {
        try {
            const { _id } = req.user;
            const { data } = req.body;

            if (req.file?.path) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    // public_id: `${_id}_image`,
                    folder: 'posts',
                });

                const post = await Post.create({
                    author: _id,
                    content: data,
                    title: '',
                    image: result.url,
                });

                await UserSchema.findOneAndUpdate(
                    { _id: _id },
                    { $push: { posts: post._id } },
                    { new: true },
                );

                return res.status(201).json({
                    status: true,
                    message: 'create post success!!!',
                    request: req.body,
                    result,
                    file: req.file.path,
                    post,
                });
            }

            const post = await Post.create({ author: _id, content: data, image: '', title: '' });

            await UserSchema.findOneAndUpdate({ _id: _id }, { $push: { posts: post._id } }, { new: true });

            const auth = await Post.find()
                .populate('author', 'name avatar email numberPhone gender address')
                .lean()
                .exec();

            return res.status(201).json({
                message: 'create post success!!!',
                status: true,
                request: req.body,
                post,
                auth,
            });
        } catch (error) {
            return res.status(500).json({
                error: { message: error.message, stack: error.stack },
            });
        }
    }

    //[GET] /users/:id/posts
    async getPosts(req, res, next) {
        try {
            const { _id } = req.params;

            const posts = await Post.find({ author: _id })
                .sort({ createdAt: -1 })
                .select('title content createdAt image')
                .populate({
                    path: 'author',
                    select: 'name avatar',
                    options: { lean: true },
                })
                .lean();

            return res.status(200).json({ request: req.params, message: 'success', posts });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[DELETE] /users/:_id/posts/:postId
    async deletePost(req, res, next) {
        try {
            const { postId, userId } = req.params;

            const [userExists, deletePostUser, post] = await Promise.all([
                UserSchema.exists({ _id: userId }).exec(),
                UserSchema.findByIdAndUpdate(userId, { $pull: { posts: postId } }).exec(),
                Post.findByIdAndDelete(postId).exec(),
            ]);

            if (!userExists) {
                return res.status(404).json({ message: 'not found account', status: false });
            }

            if (!deletePostUser) {
                return res.status(404).json({ message: 'delete user post fail!!!' });
            }

            if (!post) {
                return res.status(404).json({ message: 'not found post', status: false });
            }

            return res.status(200).json({ message: 'delete post success!!!', status: true, post });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[GET] /users/:userId/profile/images
    async getImagesProfileById(req, res, next) {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'not found user' });
        }

        try {
            const imagesProfile = await Post.find({ author: userId })
                .select('image')
                .populate({
                    path: 'author',
                    select: 'coverImage',
                    options: { lean: true },
                })
                .lean()
                .exec();

            if (!imagesProfile || imagesProfile.length === 0) {
                return res.status(404).json({ message: 'not found image', status: false });
            }

            return res.status(200).json({
                message: 'get images profile successfully!!!',
                request: req.params,
                imagesProfile,
                status: true,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[GET] /users/:userId/posts/:postId
    async getPostById(req, res, next) {
        const { userId, postId } = req.params;

        try {
            const [userExists, post] = await Promise.all([
                UserSchema.exists({ _id: userId }),
                await Post.findById(postId).select('content image').lean(),
            ]);

            if (!userExists) {
                return res.status(404).json({ message: 'not found user!!!' });
            }

            return res.json({
                message: 'find by id post successfully',
                params: req.params,
                userExists,
                post,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[POST] /users/:userId/posts/:postId
    async updatePost(req, res, next) {
        const { userId, postId } = req.params;
        const { content } = req.body;

        await UserSchema.exists({ _id: userId })
            .exec()
            .catch((error) => res.status(404).json({ error, message: 'not found user' }));

        try {
            if (req?.file) {
                const uploadImage = await cloudinary.uploader.upload(req.file.path, {
                    // public_id: `${userId}_image`,
                    folder: 'posts',
                });

                if (!uploadImage) return res.status(404).json({ message: 'upload image fail!!!' });
                const { url } = uploadImage;

                const post = await Post.findByIdAndUpdate(
                    postId,
                    { $set: { content, image: url } },
                    { returnDocument: 'after' },
                )
                    .lean()
                    .exec();

                if (!post) {
                    return res.status(404).json({ message: 'Update post fail!!!' });
                }

                return res.status(201).json({ message: 'update post successfully!!!', uploadImage, post });
            }

            const post = await Post.findByIdAndUpdate(
                postId,
                { $set: { content } },
                { returnDocument: 'after' },
            )
                .lean()
                .exec();

            if (!post) {
                res.status(404).json({ message: 'Update post fail!!!' });
            }

            return res.status(201).json({ message: 'Update post successfully!!!', post });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PostController();

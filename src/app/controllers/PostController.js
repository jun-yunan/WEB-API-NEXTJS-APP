const mongoose = require('mongoose');
const PostSchema = require('../models/PostSchema');
const cloudinary = require('../../helper/imageUpload');
const UserSchema = require('../models/UserSchema');

class PostController {
    async createPost(req, res, next) {
        const { _id } = req.user;
        const { data } = req.body;

        try {
            if (req.file?.path) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `${_id}_image`,
                    folder: 'posts',
                });

                const post = await PostSchema.create({
                    author: _id,
                    content: data,
                    title: '',
                    image: result.url,
                }).catch((error) =>
                    res.status(400).json({ error, message: 'Tạo bài không thành công', status: false }),
                );

                return res.status(201).json({
                    message: 'create post success!!!',
                    request: req.body,
                    result,
                    file: req.file.path,
                    post,
                });
            }

            const post = await PostSchema.create({ author: _id, content: data, image: '', title: '' });

            const auth = await PostSchema.find()
                .populate('author', 'name avatar email numberPhone gender address')
                .lean()
                .exec()
                .catch((error) => res.status(404).json({ error, message: 'không tìm thấy tác giả' }));

            return res.status(201).json({
                message: 'create post success!!!',
                request: req.body,
                post,
                auth,
            });
        } catch (error) {
            return res.status(500).json({
                error: { message: error.message, stack: error.stack },
                request: req.body,
            });
        }
    }

    //[GET] /users/:id/posts
    async getPost(req, res, next) {
        try {
            const { _id } = req.params;

            const posts = await PostSchema.find({ author: _id }).populate('author', 'name avatar').lean();
            res.status(200).json({ request: req.params, message: 'success', posts });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    //[DELETE] /users/:_id/posts/:postId
    async deletePost(req, res, next) {
        try {
            const { postId, userId } = req.params;

            const user = await UserSchema.exists({ _id: userId })
                .exec()
                .catch((error) => res.status(404).json({ error, message: 'not found account' }));

            const post = await PostSchema.findByIdAndDelete(postId)
                .exec()
                .catch((error) => res.status(404).json({ error, message: 'not found post' }));

            return res.status(200).json({ message: 'delete post success!!!', status: true, post, user });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PostController();

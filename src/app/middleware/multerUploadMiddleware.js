const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({});

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'src/uploads/');
//     },
//     filename: (req, file, cb) => {
//         let ext = path.extname(file.originalname);
//         cb(null, Date.now() + ext);
//     },
// });

const multerUploadMiddleware = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        // if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        if (file.mimetype.startsWith('image')) {
            callback(null, true);
        } else {
            console.log('only jpg & png file supported');
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 4,
    },
});
module.exports = multerUploadMiddleware;

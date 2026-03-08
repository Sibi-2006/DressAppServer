const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('image'), (req, res) => {
    console.log('Upload Request Received');
    if (!req.file) {
        console.log('Upload Failed: No file provided');
        return res.status(400).json({ message: 'Upload failed' });
    }

    console.log('Uploaded file details:', req.file);
    console.log('Cloudinary URL:', req.file.path);

    // Cloudinary returns the full url and public_id (path in cloudinary)
    res.json({
        url: req.file.path,
        public_id: req.file.filename
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Upload failed' });
    }
    // Cloudinary returns the full url and public_id (path in cloudinary)
    res.json({
        url: req.file.path,
        public_id: req.file.filename
    });
});

module.exports = router;

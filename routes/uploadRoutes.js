const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../config/cloudinary');

// POST /api/upload
// Accepts EITHER:
//   A) multipart/form-data with field 'image' (real mobile device)
//   B) application/json with { image: "data:image/jpeg;base64,..." } (web preview)
router.post('/', upload.single('image'), async (req, res) => {
    console.log('=== Upload Request ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.file:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NONE');
    console.log('req.body keys:', Object.keys(req.body || {}));

    try {
        let uploadResult;

        // ── Path A: File upload via multer-storage-cloudinary ──
        if (req.file) {
            console.log('Uploading via multer-cloudinary storage...');
            // multer-storage-cloudinary already uploaded the file to Cloudinary
            // req.file.path = Cloudinary URL, req.file.filename = public_id
            uploadResult = {
                secure_url: req.file.path,
                public_id: req.file.filename,
            };
            console.log('Cloudinary URL:', uploadResult.secure_url);
        }

        // ── Path B: Base64 JSON upload ──
        else if (req.body?.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
            console.log('Uploading base64 image to Cloudinary...');
            const result = await cloudinary.uploader.upload(req.body.image, {
                folder: 'neonthreads/designs',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            });
            uploadResult = {
                secure_url: result.secure_url,
                public_id: result.public_id,
            };
            console.log('Base64 upload success:', uploadResult.secure_url);
        }

        // ── No valid input ──
        else {
            console.log('No file and no base64 in request!');
            return res.status(400).json({ message: 'No image provided. Send multipart file or base64 JSON.' });
        }

        return res.json({
            url: uploadResult.secure_url,
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });

    } catch (error) {
        console.error('Upload route error:', error.message);
        return res.status(500).json({ message: error.message || 'Upload failed' });
    }
});

module.exports = router;

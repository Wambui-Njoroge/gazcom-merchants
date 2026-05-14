const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const stream = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload a file buffer to Cloudinary
async function uploadImage(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || 'gazcom_products',
                public_id: options.public_id,
                transformation: options.transformation || [
                    { width: 800, height: 800, crop: 'limit', quality: 'auto' }
                ],
                ...options
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
}

async function uploadImageFromUrl(imageUrl, options = {}) {
    return cloudinary.uploader.upload(imageUrl, {
        folder: options.folder || 'gazcom_products',
        public_id: options.public_id,
        transformation: options.transformation,
    });
}

async function deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId);
}

function getOptimizedImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
        width: options.width || 800,
        height: options.height || 800,
        crop: options.crop || 'limit',
        quality: 'auto',
        fetch_format: 'auto',
    });
}

module.exports = {
    upload,
    uploadImage,
    uploadImageFromUrl,
    deleteImage,
    getOptimizedImageUrl,
};
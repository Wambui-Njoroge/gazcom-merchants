const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    }
});

// Upload image from file buffer
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

// Upload image from URL
async function uploadImageFromUrl(imageUrl, options = {}) {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: options.folder || 'gazcom_products',
            public_id: options.public_id,
            transformation: options.transformation || [
                { width: 800, height: 800, crop: 'limit', quality: 'auto' }
            ],
            ...options
        });
        return result;
    } catch (error) {
        console.error('Error uploading from URL:', error);
        throw error;
    }
}

// Get optimized image URL
function getOptimizedImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
        width: options.width || 800,
        height: options.height || 800,
        crop: options.crop || 'limit',
        quality: options.quality || 'auto',
        fetch_format: options.format || 'auto'
    });
}

// Get thumbnail URL
function getThumbnailUrl(publicId, width = 150, height = 150) {
    return cloudinary.url(publicId, {
        width: width,
        height: height,
        crop: 'thumb',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto'
    });
}

// Delete image
async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

// List images in folder
async function listImages(folder = 'gazcom_products', maxResults = 100) {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: maxResults
        });
        return result.resources;
    } catch (error) {
        console.error('Error listing images:', error);
        throw error;
    }
}

module.exports = {
    upload,
    uploadImage,
    uploadImageFromUrl,
    getOptimizedImageUrl,
    getThumbnailUrl,
    deleteImage,
    listImages
};
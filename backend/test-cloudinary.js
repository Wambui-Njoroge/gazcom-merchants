require('dotenv').config();
const cloudinary = require('cloudinary').v2;

async function testCloudinary() {
    console.log('Testing Cloudinary connection...\n');
    
    // Check credentials
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing');
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Found' : '❌ Missing');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Found' : '❌ Missing');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.log('\n❌ Missing credentials. Please add to .env file');
        return;
    }
    
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    try {
        // Test by uploading a simple test image
        const testImage = 'https://picsum.photos/200/200';
        const result = await cloudinary.uploader.upload(testImage, {
            folder: 'test',
            public_id: 'test_connection'
        });
        
        console.log('\n✅ Cloudinary is working!');
        console.log('Test image URL:', result.secure_url);
        
        // Clean up test image
        await cloudinary.uploader.destroy('test/test_connection');
        console.log('✅ Test image cleaned up');
        
    } catch (error) {
        console.log('\n❌ Cloudinary connection failed!');
        console.log('Error:', error.message);
    }
}

testCloudinary();
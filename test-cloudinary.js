const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './backend/.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('Testing Cloudinary connection...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    // Upload a test image from your local folder
    const result = await cloudinary.uploader.upload('./product/sun_flower_keychain.jpeg', {
      folder: 'test_uploads',
    });
    
    console.log('✅ Success! Image uploaded.');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('❌ Cloudinary Error:', error.message);
    if (error.message.includes('must provide')) {
        console.error('Hint: Make sure your .env file is correctly loaded!');
    }
  }
}

testCloudinary();

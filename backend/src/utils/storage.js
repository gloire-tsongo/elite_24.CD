const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

async function storeImageBuffer(buffer, publicId, options = {}) {
  if (hasCloudinaryConfig()) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: process.env.CLOUDINARY_FOLDER || 'elite24/articles',
        public_id: publicId.replace(/[^a-z0-9_-]/gi, '-').slice(0, 120),
        resource_type: 'image',
        overwrite: true,
        transformation: [{ width: options.width || 1600, height: options.height || 900, crop: 'limit', quality: options.quality || 'auto:good', fetch_format: 'auto' }]
      }, (error, result) => error ? reject(error) : resolve(result.secure_url));
      Readable.from(buffer).pipe(stream);
    });
  }

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  const fileName = `${publicId.replace(/[^a-z0-9_-]/gi, '-').slice(0, 120)}.webp`;
  await require('sharp')(buffer).resize({ width: options.width || 1600, withoutEnlargement: true }).webp({ quality: options.quality || 82 }).toFile(path.join(uploadDir, fileName));
  return fileName;
}

function publicImageUrl(value, baseUrl = '') {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/uploads/') || value.startsWith('/images/')) return `${baseUrl}${value}`;
  return `${baseUrl}/uploads/${encodeURIComponent(value).replace(/%2F/g, '/')}`;
}

module.exports = { storeImageBuffer, publicImageUrl, hasCloudinaryConfig };

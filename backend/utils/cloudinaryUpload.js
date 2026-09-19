const cloudinary = require("../config/cloudinary");

// Wraps Cloudinary's stream upload in a Promise so controllers can use async/await
const uploadBufferToCloudinary = (buffer, folder = "vendorhub/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };

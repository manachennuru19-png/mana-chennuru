import cloudinary from '../config/cloudinary.js';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<Object>} Upload result with secure_url, public_id, resource_type
 */
export const uploadToCloudinary = async (fileBuffer, fileName, mimeType) => {
  try {
    // Determine resource type based on MIME type
    const isImage = mimeType.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    
    // Upload options
    const uploadOptions = {
      resource_type: resourceType,
      folder: 'election_documents',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Resource type (image or raw)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};


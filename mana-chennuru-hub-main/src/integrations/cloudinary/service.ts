/**
 * Cloudinary API Service
 * Used for uploading images and PDFs to Cloudinary
 * Uses unsigned upload preset for frontend uploads
 */

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: 'image' | 'raw' | 'video' | 'auto';
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload a file (PDF or Image) to Cloudinary
 * @param file - The file to upload (File object)
 * @param uploadPreset - The unsigned upload preset name (optional, defaults to env variable or 'manachennuru')
 * @returns Promise with the file URL
 */
export const uploadFileToCloudinary = async (
  file: File,
  uploadPreset?: string
): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'manachennuru';
  const preset = uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'manachennuru';

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file.');
  }

  if (!preset) {
    throw new Error('Cloudinary upload preset is not configured. Please add VITE_CLOUDINARY_UPLOAD_PRESET to your .env file or configure an unsigned upload preset in Cloudinary dashboard.');
  }

  // Determine resource type based on file type
  // IMPORTANT: PDFs must use 'raw' resource type, images use 'image'
  // Using 'image' for PDFs will cause access issues (401 errors)
  const isImage = file.type.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  // Note: For unsigned uploads, we only send the file and upload_preset
  // cloud_name goes in the URL path, not in FormData
  // resource_type is in the URL path: /raw/upload or /image/upload

  try {
    // Correct endpoint format for Cloudinary uploads:
    // - Images: /v1_1/{cloud}/image/upload
    // - PDFs/RAW: /v1_1/{cloud}/raw/upload
    // Using the wrong resource_type in the URL will cause 401 errors
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    
    console.log('Uploading to Cloudinary:', {
      cloudName,
      preset,
      resourceType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, try to get text
        const text = await response.text();
        errorData = { message: text || response.statusText };
      }

      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to upload file: ${response.statusText} (${response.status})`;
      
      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        cloudName,
        preset,
        resourceType,
        uploadUrl
      });

      // Provide more helpful error messages
      if (errorMessage.includes('Unknown API key') || errorMessage.includes('Invalid API key')) {
        throw new Error(`Cloudinary upload preset "${preset}" not found or not configured as unsigned. Please verify in Cloudinary Dashboard > Settings > Upload > Upload presets that a preset named "${preset}" exists and is set to "Unsigned" mode.`);
      }

      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('Upload successful:', data.secure_url);
    console.log('Upload response data:', {
      secure_url: data.secure_url,
      url: data.url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format
    });

    // Return the secure_url (HTTPS) - this is the publicly accessible URL
    // IMPORTANT: secure_url is the correct URL to use for displaying/downloading
    // It's in the format: https://res.cloudinary.com/{cloud}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
    // For RAW uploads, this URL should be publicly accessible if the upload preset allows public access
    // If you get 401 errors when accessing this URL, check Cloudinary Dashboard > Settings > Security > "PDF and ZIP files delivery"
    const finalUrl = data.secure_url || data.url;
    if (!finalUrl) {
      throw new Error('Cloudinary upload succeeded but no URL was returned');
    }
    
    return finalUrl;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    // If it's already a formatted error, throw it as-is
    if (error.message && error.message.includes('Cloudinary upload preset')) {
      throw error;
    }
    throw new Error(error.message || 'Failed to upload file to Cloudinary. Please check your Cloudinary configuration.');
  }
};

/**
 * Upload an image to Cloudinary
 * @param file - The image file to upload
 * @param uploadPreset - The unsigned upload preset name (optional)
 * @returns Promise with the image URL
 */
export const uploadImageToCloudinary = async (
  file: File,
  uploadPreset?: string
): Promise<string> => {
  // Validate that it's an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  return uploadFileToCloudinary(file, uploadPreset);
};

/**
 * Upload a PDF to Cloudinary
 * @param file - The PDF file to upload
 * @param uploadPreset - The unsigned upload preset name (optional)
 * @returns Promise with the PDF URL
 */
export const uploadPdfToCloudinary = async (
  file: File,
  uploadPreset?: string
): Promise<string> => {
  // Validate that it's a PDF
  if (file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }
  return uploadFileToCloudinary(file, uploadPreset);
};

/**
 * Validate file type for election commission uploads
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns Validation result
 */
export const validateElectionFile = (
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } => {
  // Check file type - PDF or images (JPG, PNG)
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed types: PDF, JPG, PNG',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
};


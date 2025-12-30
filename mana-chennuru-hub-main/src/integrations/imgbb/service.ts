/**
 * ImgBB API Service
 * Used for uploading images to ImgBB image hosting service
 */

interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload an image to ImgBB
 * @param imageFile - The image file to upload (File object or base64 string)
 * @param fileName - Optional file name
 * @returns Promise with the image URL
 */
export const uploadImageToImgBB = async (
  imageFile: File | string,
  fileName?: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error('ImgBB API key is not configured. Please add VITE_IMGBB_API_KEY to your .env file.');
  }

  let imageData: string;
  let processedFile: File | string = imageFile;

  // Compress and optimize File before converting to base64
  if (imageFile instanceof File) {
    // Only compress if file is larger than 500KB
    if (imageFile.size > 500 * 1024) {
      try {
        processedFile = await compressImage(imageFile, 1920, 1920, 0.85);
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
        processedFile = imageFile;
      }
    }
    imageData = await fileToBase64(processedFile instanceof File ? processedFile : imageFile);
  } else {
    // Assume it's already a base64 string (remove data:image prefix if present)
    imageData = imageFile.replace(/^data:image\/[a-z]+;base64,/, '');
  }

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', imageData);
  if (fileName) {
    formData.append('name', fileName);
  }

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to upload image: ${response.statusText}`);
    }

    const data: ImgBBResponse = await response.json();

    if (!data.success) {
      throw new Error(data.data?.image?.url ? 'Upload failed' : 'Unknown error occurred');
    }

    // Return the direct image URL
    return data.data.url;
  } catch (error: any) {
    console.error('ImgBB upload error:', error);
    throw new Error(error.message || 'Failed to upload image to ImgBB');
  }
};

/**
 * Compress and resize image for faster upload
 */
const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.85): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Failed to read image'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a File object to base64 string (without data URL prefix)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/...;base64, prefix
        const base64 = reader.result.includes(',') 
          ? reader.result.split(',')[1] 
          : reader.result;
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 */
export const validateImageFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validTypes.join(', ')}`,
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


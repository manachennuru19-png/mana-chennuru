# ImgBB Image Upload Integration

## Overview
ImgBB API has been integrated to handle image uploads across all sections of the application. Images are uploaded to ImgBB and the URLs are stored in Firestore.

## Configuration

### Environment Variables
Add the following to your `.env` file:
```env
VITE_IMGBB_API_KEY=51c3a67a9557fa69232ca4f06687bc35
```

The API key has been added to `env.example` for reference.

## Usage

### ImageUpload Component
A reusable `ImageUpload` component has been created at `src/components/ImageUpload.tsx`.

**Features:**
- File validation (JPEG, PNG, GIF, WebP)
- File size validation (default: 10MB max)
- Image preview
- Upload progress indication
- Error handling

**Example Usage:**
```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  onImageUploaded={(imageUrl) => setImageUrl(imageUrl)}
  currentImageUrl={imageUrl}
  label="Upload Image"
  maxSizeMB={10}
/>
```

### ImgBB Service
The service is located at `src/integrations/imgbb/service.ts`.

**Functions:**
- `uploadImageToImgBB(file: File | string, fileName?: string): Promise<string>`
  - Uploads an image file or base64 string to ImgBB
  - Returns the direct image URL
- `validateImageFile(file: File, maxSizeMB?: number): { valid: boolean; error?: string }`
  - Validates image file type and size

**Example:**
```typescript
import { uploadImageToImgBB } from '@/integrations/imgbb/service';

const handleUpload = async (file: File) => {
  try {
    const imageUrl = await uploadImageToImgBB(file, 'my-image.jpg');
    console.log('Image URL:', imageUrl);
    // Store imageUrl in Firestore
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Integrated Sections

### ✅ Gallery Section
- Full image upload integration
- Users can upload images when adding/editing gallery items
- Images are displayed in cards

### 🔄 Other Sections (Ready for Integration)
The following sections can be easily updated to support image uploads:
- News (for featured images)
- Temples (for temple images)
- Government Schemes (for scheme images)
- Agriculture (for crop/product images)

## Image Storage Flow

1. User selects an image file
2. `ImageUpload` component validates the file
3. File is converted to base64
4. Base64 string is sent to ImgBB API
5. ImgBB returns a direct image URL
6. URL is stored in Firestore document
7. Image is displayed using the URL

## Supported Formats
- JPEG / JPG
- PNG
- GIF
- WebP

## File Size Limit
Default: 10MB per image
Can be customized per component via `maxSizeMB` prop

## Error Handling
All upload errors are handled and displayed via toast notifications:
- Invalid file type
- File size exceeded
- Network errors
- API errors



# Cloudinary Setup Guide

## Overview
This application uses Cloudinary for uploading PDFs and images for the Election Commission section.

## Setup Steps

### 1. Create a Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. After signing up, you'll see your **Cloud Name** in the dashboard (e.g., `manachennuru`)

### 2. Create an Unsigned Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `manachennuru` (or any name you prefer)
   - **Signing mode**: Select **Unsigned**
   - **Folder** (optional): You can organize uploads into a folder like `election-commission`
   - **Allowed file types**: 
     - For PDFs: Select "Raw" or "Any"
     - For Images: Select "Images"
   - **Upload manipulation** (optional): You can add transformations if needed
5. Click **Save**

### 3. Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
VITE_CLOUDINARY_CLOUD_NAME=manachennuru
VITE_CLOUDINARY_UPLOAD_PRESET=manachennuru
```

Replace `manachennuru` with your actual cloud name and upload preset name.

### 4. Restart Your Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## Troubleshooting

### Error: "Unknown API key" or "Invalid upload preset"

This error typically occurs when:
1. **The upload preset doesn't exist** in your Cloudinary account
2. **The upload preset name doesn't match** what's configured in your code
3. **The upload preset is not set to "Unsigned" mode** (it might be set to "Signed" which requires API keys)
4. **The `.env` file is not being read** (make sure it's in the project root and restart the dev server)

**Solution:**
1. **Verify in Cloudinary Dashboard:**
   - Go to https://cloudinary.com/console/settings/upload
   - Scroll to **Upload presets** section
   - Look for a preset with the name `manachennuru` (or whatever you configured)
   - If it doesn't exist, **create a new one:**
     - Click "Add upload preset"
     - Set the name to `manachennuru` (must match exactly)
     - **IMPORTANT:** Set **Signing mode** to **"Unsigned"** (this is critical!)
     - For file types, select "Any" or configure both "Raw" (for PDFs) and "Images"
     - Click "Save"
   - If it exists, click on it and verify:
     - The name matches exactly (case-sensitive)
     - **Signing mode is set to "Unsigned"** (not "Signed")
2. **Verify your `.env` file** (in the project root, not backend folder):
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=manachennuru
   VITE_CLOUDINARY_UPLOAD_PRESET=manachennuru
   ```
   - Make sure the values match what's in Cloudinary dashboard
   - The preset name must match exactly (including capitalization)
3. **Restart your frontend dev server** after changing `.env`:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```
4. **Check the browser console** - the improved error messages will now show exactly which preset name is being used

### Error: "Resource not found"

This means the cloud name is incorrect.

**Solution:**
- Check your Cloudinary dashboard for the correct cloud name
- Update `VITE_CLOUDINARY_CLOUD_NAME` in your `.env` file

## Testing

To test if Cloudinary is working:

1. Go to the Election Commission page
2. Click "Add New"
3. Fill in the title and description
4. Select a PDF or image file
5. Click "Save"

If successful, you should see a success message and the file URL will be saved to Firebase.

## Notes

- **Unsigned upload presets** are required for frontend uploads (no API secret needed)
- PDFs are uploaded as "raw" type in Cloudinary
- Images are uploaded as "image" type in Cloudinary
- File size limit: 10MB (configurable in the code)


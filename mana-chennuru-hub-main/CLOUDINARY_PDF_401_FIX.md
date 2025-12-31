# Cloudinary PDF 401 Unauthorized Error - Root Cause & Fix

## Root Cause Analysis

The 401 Unauthorized error occurs when trying to access PDF files uploaded to Cloudinary, even though:
- Uploads are successful
- Upload preset is set to "Unsigned"
- Code uses correct endpoints (`/raw/upload`)

### Why This Happens

1. **Cloudinary Security Settings**: Even with unsigned uploads, Cloudinary has security settings that can restrict access to RAW files (PDFs)
2. **Upload Preset Configuration**: The preset might not have "Public" access enabled for delivery
3. **Resource Type Mismatch**: If the file is accidentally uploaded as `image` instead of `raw`, it won't be accessible correctly

## Current Code Analysis

✅ **Upload Code is CORRECT**:
- Uses: `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
- Correctly determines `resourceType` as `'raw'` for PDFs
- Returns `secure_url` which is the correct public URL format

✅ **Display Code is CORRECT**:
- Uses iframe with the `secure_url` directly
- No unnecessary transformations that could break the URL

## The Real Issue

The 401 error suggests **Cloudinary account-level security settings** are blocking public access to RAW files, OR the upload preset doesn't allow public delivery.

## Required Fixes

### 1. Check Cloudinary Upload Preset Settings

Go to: **Cloudinary Dashboard > Settings > Upload > Upload presets > manachennuru**

Verify:
- ✅ **Signing mode**: "Unsigned" 
- ✅ **Access mode**: "Public" (NOT "Authenticated")
- ✅ **Resource type**: "Any" or "Raw" (NOT just "Image")
- ✅ **File types**: Allow PDFs

### 2. Check Cloudinary Security Settings

Go to: **Cloudinary Dashboard > Settings > Security**

Verify:
- ✅ **Allowed fetch domains**: Should include your domain OR be empty (allows all)
- ✅ **PDF and ZIP files delivery**: Should be **ENABLED**
- ✅ **Access control**: Should allow public access

### 3. Code Verification

The code is already correct, but ensure:

```typescript
// Upload uses correct endpoint
const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

// Returns secure_url (public URL)
return data.secure_url || data.url;

// Display uses URL directly
<iframe src={pdfUrl} />
```

## Final Checklist

- [ ] Upload preset is "Unsigned" mode
- [ ] Upload preset allows "Public" access
- [ ] Upload preset allows "Raw" resource type
- [ ] Cloudinary Security > "PDF and ZIP files delivery" is ENABLED
- [ ] Code uses `/raw/upload` endpoint for PDFs
- [ ] Code returns and uses `secure_url`
- [ ] No URL transformations break the public URL format

## Expected Result

After fixing Cloudinary settings:
- ✅ PDFs upload successfully
- ✅ PDF URLs are publicly accessible (no 401)
- ✅ PDFs display in iframe
- ✅ PDFs can be downloaded directly


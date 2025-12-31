# PDF 401 Error - Complete Fix Guide

## Root Cause Explanation (Simple Terms)

**The Problem**: PDFs upload successfully to Cloudinary, but when you try to view them, you get a 401 "Unauthorized" error.

**Why It Happens**: Even though your upload preset is "Unsigned" (which means uploads don't need authentication), Cloudinary has **separate security settings** that control whether uploaded files can be **publicly accessed** (viewed/downloaded). The 401 error means Cloudinary is blocking public access to your PDF files.

**It's NOT a code problem** - your code is correct! It's a **Cloudinary account configuration** issue.

---

## Code Analysis - Why It's Correct

### ✅ Upload Code (`src/integrations/cloudinary/service.ts`)

```typescript
// CORRECT: Uses /raw/upload endpoint for PDFs
const resourceType = isImage ? 'image' : 'raw';  // PDFs → 'raw'
const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

// CORRECT: Returns secure_url which is the public URL
return data.secure_url || data.url;
```

**Why this works:**
- PDFs are uploaded as `resource_type: 'raw'` (correct)
- Uses the `/raw/upload` endpoint (correct)
- Returns `secure_url` which is the publicly accessible URL format (correct)

### ✅ Display Code (`src/components/PDFViewerModal.tsx`)

```typescript
// CORRECT: Uses secure_url directly in iframe
<iframe src={pdfUrl} />
```

**Why this works:**
- Uses the `secure_url` directly without modifications (correct)
- Iframe is the standard way to display PDFs (correct)

---

## The Real Fix: Cloudinary Dashboard Settings

You need to enable **public delivery** for PDF files in your Cloudinary account:

### Step 1: Enable PDF Delivery

1. Go to **Cloudinary Dashboard**
2. Navigate to **Settings → Security**
3. Scroll to **"PDF and ZIP files delivery"** section
4. **ENABLE** this option (toggle it ON)
5. Click **Save**

### Step 2: Verify Upload Preset Settings

1. Go to **Settings → Upload → Upload presets**
2. Click on your preset: **"manachennuru"**
3. Verify these settings:
   - **Signing mode**: `Unsigned` ✅
   - **Access mode**: `Public` ✅ (NOT "Authenticated")
   - **Resource type**: `Any` or `Raw` ✅ (NOT just "Image")
   - **Allowed file types**: Should include PDFs ✅

### Step 3: Test the Fix

1. Upload a new PDF file
2. Try to view it in your application
3. The 401 error should be gone!

---

## Verification Checklist

After making the Cloudinary settings changes:

- [ ] Cloudinary Dashboard → Settings → Security → "PDF and ZIP files delivery" is **ENABLED**
- [ ] Upload preset "manachennuru" has **Access mode: Public**
- [ ] Upload preset allows **Resource type: Raw** (or "Any")
- [ ] Code uses `/raw/upload` endpoint for PDFs ✅ (already correct)
- [ ] Code returns `secure_url` ✅ (already correct)
- [ ] Display uses URL directly in iframe ✅ (already correct)

---

## Expected Result

✅ PDFs upload successfully  
✅ PDF URLs are publicly accessible (no 401 errors)  
✅ PDFs display correctly in iframe  
✅ PDFs can be downloaded  

---

## If the Problem Persists

If you still get 401 errors after enabling "PDF and ZIP files delivery":

1. **Check the actual PDF URL** in browser console - try opening it directly in a new tab
2. **Verify the upload preset name** matches exactly: `manachennuru`
3. **Check Cloudinary account type** - some free accounts have restrictions
4. **Try uploading a new PDF** after changing settings (old uploads might keep old permissions)

---

## Summary

- ✅ **Your code is correct** - no changes needed
- ⚠️ **Cloudinary settings need to be updated** - enable "PDF and ZIP files delivery"
- 📝 **The fix is in Cloudinary Dashboard**, not in your code


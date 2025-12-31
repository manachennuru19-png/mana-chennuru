# Netlify Deployment Guide

## Current Architecture

**Good News!** Your frontend currently does **direct Cloudinary uploads** (client-side), which means:

✅ **You do NOT need to deploy the backend for basic functionality**  
✅ **Frontend can be deployed to Netlify independently**  
✅ **PDF/image uploads work directly from the browser to Cloudinary**

## Deployment Options

### Option 1: Frontend Only (Recommended - Current Setup)

Since your app uses direct Cloudinary uploads, you can deploy just the frontend:

1. **Deploy Frontend to Netlify** (see steps below)
2. **No backend deployment needed** ✨

### Option 2: Full Stack (If You Want to Use Backend Later)

If you want to use the backend API endpoints in the future:

1. **Deploy Frontend to Netlify**
2. **Deploy Backend separately** to:
   - Railway (https://railway.app) - Recommended
   - Render (https://render.com)
   - Heroku (https://heroku.com)
   - DigitalOcean App Platform
   - AWS/GCP/Azure

---

## Step-by-Step: Deploy Frontend to Netlify

### 1. Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy via Netlify Dashboard

1. **Go to Netlify**: https://app.netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your repository** (GitHub/GitLab/Bitbucket)
4. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These should auto-detect from `netlify.toml`

### 3. Configure Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id (optional)
VITE_IMGBB_API_KEY=your_imgbb_api_key
VITE_CLOUDINARY_CLOUD_NAME=dpi1webfs
VITE_CLOUDINARY_UPLOAD_PRESET=manachennuru
VITE_ADMIN_EMAILS=your-admin@email.com (optional)
```

### 4. Deploy!

Click "Deploy site" and wait for the build to complete.

Your site will be live at: `https://your-site-name.netlify.app`

---

## If You Want to Deploy Backend (Optional)

### Recommended: Deploy Backend to Railway

Railway is easy and free to start:

1. **Go to Railway**: https://railway.app
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**
4. **Select the `backend` folder** as the root
5. **Add Environment Variables**:
   ```
   PORT=5000
   CLOUDINARY_CLOUD_NAME=dpi1webfs
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FIREBASE_PROJECT_ID=manachennuru-a7e84
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@manachennuru-a7e84.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FRONTEND_URL=https://your-site-name.netlify.app
   ADMIN_EMAILS=admin@example.com
   ```
6. **Railway will auto-detect** it's a Node.js app and deploy it
7. **Get the backend URL** (e.g., `https://your-backend.railway.app`)

### Update Frontend to Use Backend (If Needed)

If you deploy the backend, update your frontend environment variables:

```
VITE_BACKEND_URL=https://your-backend.railway.app
```

Then update your code to use the backend API instead of direct Cloudinary uploads.

---

## Current Status

✅ **Frontend**: Ready for Netlify deployment  
✅ **Backend**: Exists but not currently used by frontend  
✅ **Cloudinary Uploads**: Working directly from browser (no backend needed)  
✅ **Firebase**: Working directly from browser (no backend needed)  

---

## Quick Checklist

For **Frontend Only** deployment:
- [ ] Push code to GitHub/GitLab
- [ ] Deploy to Netlify
- [ ] Add environment variables in Netlify
- [ ] Test the deployed site
- [ ] Done! ✨

For **Full Stack** deployment:
- [ ] Deploy frontend to Netlify
- [ ] Deploy backend to Railway/Render
- [ ] Update frontend environment variables with backend URL
- [ ] Update code to use backend API (if not already)
- [ ] Test both frontend and backend

---

## Important Notes

1. **Environment Variables**: All `VITE_` prefixed variables are needed for frontend
2. **Cloudinary**: Make sure "PDF and ZIP files delivery" is enabled in Cloudinary Dashboard
3. **Firebase**: Ensure Firebase security rules allow public read access
4. **CORS**: If using backend, update `FRONTEND_URL` in backend to match Netlify URL

---

## Support

- Netlify Docs: https://docs.netlify.com
- Railway Docs: https://docs.railway.app
- Current setup works without backend - deploy frontend first! 🚀


# Netlify Deployment Guide

This guide will help you deploy the Mana Chennuru Hub application to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Your project repository on GitHub/GitLab/Bitbucket
3. Environment variables configured

## Deployment Steps

### Method 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Log in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with your GitHub/GitLab/Bitbucket account

3. **Create a New Site**
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Netlify will auto-detect the build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`

4. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_firebase_app_id
     VITE_IMGBB_API_KEY=your_imgbb_api_key
     ```
   - Click "Save"

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site
   - Select "Create & configure a new site"
   - Choose your team
   - Site name (or leave blank for auto-generated)

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_FIREBASE_API_KEY "your_firebase_api_key"
   netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_firebase_auth_domain"
   netlify env:set VITE_FIREBASE_PROJECT_ID "your_firebase_project_id"
   netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_firebase_storage_bucket"
   netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_firebase_messaging_sender_id"
   netlify env:set VITE_FIREBASE_APP_ID "your_firebase_app_id"
   netlify env:set VITE_IMGBB_API_KEY "your_imgbb_api_key"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Important Configuration Files

### `netlify.toml`
- Configures build command and publish directory
- Sets up redirects for React Router (SPA routing)

### `public/_redirects`
- Ensures all routes redirect to `index.html` for client-side routing
- Prevents 404 errors when accessing routes directly

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Verify Node.js version (Netlify uses Node 18 by default)
- Check build logs in Netlify dashboard

### 404 Errors on Routes
- Ensure `public/_redirects` file exists
- Verify `netlify.toml` redirects configuration
- Clear Netlify cache and redeploy

### Environment Variables Not Working
- Make sure variables start with `VITE_` prefix
- Redeploy after adding/updating environment variables
- Check variable names match exactly (case-sensitive)

### Firebase Errors
- Verify Firebase configuration in environment variables
- Check Firebase security rules allow public read access
- Ensure Firebase project is active

## Custom Domain Setup

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:
- Every push triggers a new build
- Build status is shown in GitHub/GitLab
- Preview deployments are created for pull requests

## Build Settings Summary

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18
- **Framework:** Vite + React

## Support

For issues specific to Netlify deployment, check:
- Netlify Documentation: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com


# Running the Project Locally

## 📋 Prerequisites

Before running the project, make sure you have:
- **Node.js** installed (v18 or higher recommended)
- **npm** (comes with Node.js) or **bun**
- A **Firebase project** set up (optional for basic testing, required for full functionality)

## 🚀 Quick Start

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

This will install all required dependencies including Firebase SDK.

### Step 2: Set Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   # On Windows (PowerShell)
   Copy-Item env.example .env
   
   # On Mac/Linux
   cp env.example .env
   ```

2. **Open the `.env` file** and add your Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

   **Note:** If you haven't set up Firebase yet, you can run the project but authentication won't work. See `FIREBASE_SETUP.md` for detailed Firebase setup instructions.

### Step 3: Start the Development Server

Run the development server:

```bash
npm run dev
```

The project will start and you'll see output like:

```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://[your-ip]:8080/
```

### Step 4: Open in Browser

Open your browser and navigate to:

**http://localhost:8080**

You should see the MANA CHENNURU homepage!

## 📝 Available Scripts

- **`npm run dev`** - Start development server (port 8080)
- **`npm run build`** - Build for production
- **`npm run build:dev`** - Build for development
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## ⚠️ Troubleshooting

### Port 8080 Already in Use

If port 8080 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  port: 3000, // Change to any available port
}
```

Or specify a different port when running:

```bash
npm run dev -- --port 3000
```

### Firebase Configuration Errors

If you see Firebase configuration warnings in the console:
- Make sure you've created a `.env` file
- Check that all Firebase environment variables are set
- Verify your Firebase credentials are correct
- See `FIREBASE_SETUP.md` for help setting up Firebase

### Module Not Found Errors

If you see module not found errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

On Windows:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### TypeScript Errors

If you see TypeScript errors:
- Make sure all dependencies are installed: `npm install`
- Check that `tsconfig.json` files are present
- Restart your IDE/editor

## 🎯 What to Expect

When you run `npm run dev`, you should see:

1. **Homepage** (`/`) - Village portal with service sections
2. **Shops** (`/shops`) - Shop directory (currently with hardcoded data)
3. **News** (`/news`) - News page
4. **Culture** (`/culture`) - Culture & temples page
5. **Login** (`/login`) - Authentication page (requires Firebase setup)

## 🔧 Development Tips

1. **Hot Module Replacement (HMR)**: Changes to files are automatically reflected in the browser
2. **Browser DevTools**: Open browser DevTools (F12) to see console logs and errors
3. **Network Tab**: Check network requests if Firebase calls aren't working
4. **React DevTools**: Install React DevTools browser extension for better debugging

## 📚 Next Steps

Once the project is running:

1. **Set up Firebase** (if not done already) - See `FIREBASE_SETUP.md`
2. **Create Firestore collections** for your data
3. **Update components** to use Firebase instead of hardcoded data
4. **Customize** the design and content for your village

## 🆘 Need Help?

- Check `FIREBASE_SETUP.md` for Firebase setup
- Check `FIREBASE_MIGRATION_SUMMARY.md` for migration details
- Check `PROJECT_STRUCTURE_ANALYSIS.md` for project overview

Happy coding! 🚀


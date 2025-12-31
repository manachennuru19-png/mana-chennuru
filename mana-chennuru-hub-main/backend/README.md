# Mana Chennuru Backend API

Backend API server for Mana Chennuru Hub - handles Cloudinary uploads and document management.

## Features

- File upload to Cloudinary (PDFs and Images)
- Document metadata storage in Firebase Firestore
- RESTful API endpoints
- Admin authentication
- File validation and error handling

## Prerequisites

- Node.js (v18 or higher)
- Firebase project with Firestore enabled
- Cloudinary account

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Firebase service account client email
   - `FIREBASE_PRIVATE_KEY`: Firebase service account private key
   - `PORT`: Server port (default: 5000)
   - `FRONTEND_URL`: Frontend URL for CORS
   - `ADMIN_EMAILS`: Comma-separated list of admin emails

   **To get Firebase credentials:**
   1. Go to Firebase Console > Project Settings > Service Accounts
   2. Click "Generate New Private Key"
   3. Download the JSON file
   4. Extract the values for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Upload Document
- **POST** `/api/upload`
- **Auth**: Admin only
- **Body**: multipart/form-data
  - `file`: File to upload (PDF, JPG, or PNG, max 10MB)
  - `title`: Document title (required)
  - `description`: Document description (optional)
  - `source`: "Election Commission" or "Village News" (optional, default: "Election Commission")
  - `userId`: User ID (required)
- **Headers**: `x-user-email`: Admin email
- **Response**: Document data with Cloudinary URL

### Get Documents
- **GET** `/api/documents`
- **Query Parameters**:
  - `limit`: Number of documents to return (default: 3)
  - `source`: Filter by source ("Election Commission" or "Village News")
- **Response**: Array of documents

### Get Document by ID
- **GET** `/api/documents/:id`
- **Response**: Document data

### Delete Document
- **DELETE** `/api/documents/:id`
- **Auth**: Authenticated user (owner only)
- **Headers**: `x-user-id`: User ID
- **Response**: Success message

## Frontend Integration

### Upload Example (using fetch)

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Document Title');
formData.append('description', 'Document description');
formData.append('source', 'Election Commission');
formData.append('userId', user.uid);

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  headers: {
    'x-user-email': user.email, // Admin email
  },
  body: formData,
});

const data = await response.json();
```

### Get Documents Example

```javascript
const response = await fetch('http://localhost:5000/api/documents?limit=10');
const data = await response.json();
```

## Security Notes

1. **Admin Authentication**: Currently uses basic email check. For production:
   - Integrate with Firebase Admin SDK
   - Use JWT tokens
   - Implement proper session management

2. **File Validation**: Files are validated for type and size before upload

3. **CORS**: Configured to allow requests from frontend URL only

## Project Structure

```
backend/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── firebase.js        # Firebase Admin SDK initialization
│   └── database.js        # Firestore connection check
├── controllers/
│   └── documentController.js  # Document CRUD operations
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling
│   └── upload.js          # Multer configuration
├── models/
│   └── Document.js        # Firestore document operations
├── routes/
│   └── documentRoutes.js  # API routes
├── services/
│   └── cloudinaryService.js  # Cloudinary upload/delete
├── .env.example
├── package.json
└── server.js              # Entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Error Handling

All errors are handled by the error handler middleware and return JSON responses with appropriate status codes.

## License

ISC


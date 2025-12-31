import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from '../controllers/documentController.js';
import { upload } from '../middleware/upload.js';
import { isAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload document (Admin only)
router.post('/upload', isAdmin, upload.single('file'), uploadDocument);

// Get all documents (Public access)
router.get('/documents', getDocuments);

// Get document by ID (Public access)
router.get('/documents/:id', getDocumentById);

// Delete document (Authenticated user - owner only)
router.delete('/documents/:id', requireAuth, deleteDocument);

export default router;


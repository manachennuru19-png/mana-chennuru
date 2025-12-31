import * as Document from '../models/Document.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import admin from '../config/firebase.js';

/**
 * Upload a document
 * POST /api/upload
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file uploaded',
      });
    }

    const { title, description, source, userId } = req.body;

    // Validate required fields
    if (!title || !userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title and userId are required',
      });
    }

    // Validate source
    const validSources = ['Election Commission', 'Village News'];
    const documentSource = source || 'Election Commission';
    
    if (!validSources.includes(documentSource)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Source must be one of: ${validSources.join(', ')}`,
      });
    }

    // Determine file type
    const isImage = req.file.mimetype.startsWith('image/');
    const fileType = isImage ? 'image' : 'pdf';

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save document metadata to Firestore
    const documentData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      fileUrl: uploadResult.secure_url,
      fileType,
      source: documentSource,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      userId,
    };

    const savedDocument = await Document.createDocument(documentData);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: savedDocument.id,
        title: savedDocument.title,
        description: savedDocument.description,
        fileUrl: savedDocument.fileUrl,
        fileType: savedDocument.fileType,
        source: savedDocument.source,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
        createdAt: savedDocument.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents
 * GET /api/documents
 */
export const getDocuments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const source = req.query.source; // Optional filter by source

    // Build query
    const query = {};
    if (source) {
      query.source = source;
    }

    // Fetch documents from Firestore
    const documents = await Document.getDocuments(query, limit);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 * GET /api/documents/:id
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const document = await Document.getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Document not found',
      });
    }

    // Check if user owns the document
    if (document.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own documents',
      });
    }

    // Delete from Firestore
    await Document.deleteDocument(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

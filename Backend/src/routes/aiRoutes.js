import express from 'express';
import multer from 'multer';
import { getDocuments, chat, uploadDocument } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// router.use(protect); // All AI routes are protected

router.get('/documents', getDocuments);
router.post('/documents/upload', upload.single('file'), uploadDocument);
router.post('/chat', chat);

export default router;

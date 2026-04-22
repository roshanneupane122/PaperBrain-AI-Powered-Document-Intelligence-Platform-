import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// ✅ Use a getter so the URL is read at request time (after dotenv has loaded)
// This fixes the issue where process.env.AI_SERVICE_URL was undefined at module init.
const getAiService = () =>
  axios.create({
    baseURL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  });

// @desc    Get all documents (Proxied to AI service)
// @route   GET /api/ai/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const response = await getAiService().get('/api/documents');
    res.status(200).json(response.data);
  } catch (err) {
    console.error(`AI SERVICE ERROR [getDocuments]:`, err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI Service is unreachable. Make sure the Python API is running.',
      });
    }
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.detail || 'AI Service Error',
    });
  }
};

// @desc    Upload document (Proxied to AI service)
// @route   POST /api/ai/documents/upload
// @access  Private
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload a file' });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    console.log(`Proxying upload to: ${aiUrl}/api/documents/upload`);

    const response = await getAiService().post('/api/documents/upload', formData, {
      headers: { ...formData.getHeaders() },
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(200).json(response.data);
  } catch (err) {
    console.error(`AI SERVICE ERROR [uploadDocument]: ${err.message}`);
    if (err.code) console.error(`Error Code: ${err.code}`);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, error: 'AI Service is unreachable for upload.' });
    }

    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.detail || 'AI Service Error during upload',
    });
  }
};

// @desc    Chat with document (Proxied to AI service)
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res) => {
  try {
    const response = await getAiService().post('/api/chat', req.body);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(`AI SERVICE ERROR [chat]: ${err.message}`);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, error: 'AI Service is unreachable for chat.' });
    }
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.detail || 'AI Service Error',
    });
  }
};

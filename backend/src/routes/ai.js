const express = require('express');
const { parseServiceRequest } = require('../services/aiService');
const router = express.Router();

/**
 * POST /api/v1/ai/parse-request
 * Convert customer natural language description into structured booking parameters.
 */
router.post('/parse-request', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text description is required' });
    }

    const parsed = await parseServiceRequest(text);
    res.json({ parsed });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const { processIncomingMessage } = require('../services/whatsappService');
const router = express.Router();

/**
 * GET /whatsapp/webhook
 * WhatsApp webhook verification (required by Meta).
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * POST /whatsapp/webhook
 * Receive incoming WhatsApp messages and map to API actions.
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const body = req.body;

    // Always respond 200 quickly to avoid webhook retries
    res.sendStatus(200);

    // Process the message asynchronously
    if (body.object === 'whatsapp_business_account' || body.entry) {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const messages = change.value?.messages || [];
          for (const message of messages) {
            if (message.type === 'text') {
              const phone = message.from;
              const text = message.text?.body || '';
              const prisma = req.app.locals.prisma;
              await processIncomingMessage(prisma, phone, text);
            }
          }
        }
      }
    }

    // Also handle simplified mock format: { phone, message }
    if (body.phone && body.message) {
      const prisma = req.app.locals.prisma;
      const result = await processIncomingMessage(prisma, body.phone, body.message);
      // Already sent 200, but log the result
      console.log('WhatsApp mock result:', result);
    }
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
  }
});

module.exports = router;

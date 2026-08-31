/**
 * WhatsApp Business Cloud API Service (Mock Mode)
 * 
 * In production: uses Meta's WhatsApp Business Cloud API.
 * In mock mode: logs all messages to console.
 * 
 * The webhook handler maps incoming keywords to existing API endpoints:
 * - "1" → accept offer
 * - "2" → decline offer
 * - "START" → mark job in_progress
 * - "DONE" → mark job completed
 */

/**
 * Send a WhatsApp message (mock: logs to console).
 * In production: POST to https://graph.facebook.com/v18.0/{phone_number_id}/messages
 */
async function sendMessage(phone, message) {
  console.log(`📱 WhatsApp → ${phone}: ${message}`);

  // Production implementation would be:
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       messaging_product: 'whatsapp',
  //       to: phone,
  //       type: 'text',
  //       text: { body: message },
  //     }),
  //   }
  // );
  // return response.json();

  return { success: true, mock: true };
}

/**
 * Send a job offer notification to a worker via WhatsApp.
 */
async function sendJobOffer(phone, booking, offer) {
  const message = `🔔 New job: ${booking.category?.name || 'Service'}, ${Math.round(offer.proximity_score * 5)}km away, ₹${booking.price}. Reply 1 to accept, 2 to decline.`;
  return sendMessage(phone, message);
}

/**
 * Send job acceptance confirmation.
 */
async function sendJobAccepted(phone, booking) {
  const message = `✅ Job accepted! Customer: ${booking.customer?.name || 'Customer'}, ${booking.address_text}. Reply 'START' when you begin, 'DONE' when finished.`;
  return sendMessage(phone, message);
}

/**
 * Send job completion + payment confirmation.
 */
async function sendJobCompleted(phone, workerPayout) {
  const message = `🎉 Marked complete. Payment of ₹${workerPayout} (after cooperative fee) added to your wallet.`;
  return sendMessage(phone, message);
}

/**
 * Process an incoming WhatsApp message.
 * Maps keywords to existing API actions.
 */
async function processIncomingMessage(prisma, phone, messageText) {
  const text = messageText.trim().toUpperCase();

  // Find the user by phone
  const user = await prisma.user.findUnique({
    where: { phone },
    include: { worker_profile: true }
  });

  if (!user || user.role !== 'worker') {
    await sendMessage(phone, 'Please register as a worker on the SahakarSeva app first.');
    return { action: 'unknown_user' };
  }

  // Handle "1" — accept the latest pending offer
  if (text === '1') {
    const pendingOffer = await prisma.matchOffer.findFirst({
      where: {
        worker_id: user.id,
        response: 'pending',
        expires_at: { gt: new Date() }
      },
      orderBy: { offered_at: 'desc' },
      include: {
        booking: {
          include: { category: true, customer: true }
        }
      }
    });

    if (!pendingOffer) {
      await sendMessage(phone, 'No pending job offer found.');
      return { action: 'no_offer' };
    }

    // Accept via match engine
    const { acceptOffer } = require('./matchEngine');
    const booking = await acceptOffer(prisma, pendingOffer.id, user.id);
    await sendJobAccepted(phone, booking);
    return { action: 'accepted', bookingId: booking.id };
  }

  // Handle "2" — decline the latest pending offer
  if (text === '2') {
    const pendingOffer = await prisma.matchOffer.findFirst({
      where: {
        worker_id: user.id,
        response: 'pending',
      },
      orderBy: { offered_at: 'desc' }
    });

    if (!pendingOffer) {
      await sendMessage(phone, 'No pending job offer found.');
      return { action: 'no_offer' };
    }

    const { declineOffer } = require('./matchEngine');
    await declineOffer(prisma, pendingOffer.id);
    await sendMessage(phone, 'Job declined. We\'ll offer it to another worker.');
    return { action: 'declined', offerId: pendingOffer.id };
  }

  // Handle "START" — mark current job as in_progress
  if (text === 'START') {
    const activeBooking = await prisma.booking.findFirst({
      where: {
        assigned_worker_id: user.id,
        status: 'assigned',
      },
      orderBy: { created_at: 'desc' }
    });

    if (!activeBooking) {
      await sendMessage(phone, 'No assigned job found.');
      return { action: 'no_booking' };
    }

    await prisma.booking.update({
      where: { id: activeBooking.id },
      data: { status: 'in_progress' }
    });

    await sendMessage(phone, 'Job started! Reply DONE when finished.');
    return { action: 'started', bookingId: activeBooking.id };
  }

  // Handle "DONE" — mark current job as completed
  if (text === 'DONE') {
    const activeBooking = await prisma.booking.findFirst({
      where: {
        assigned_worker_id: user.id,
        status: 'in_progress',
      },
      orderBy: { created_at: 'desc' },
      include: {
        assigned_worker: {
          include: { worker_profile: { include: { cooperative: true } } }
        }
      }
    });

    if (!activeBooking) {
      await sendMessage(phone, 'No in-progress job found.');
      return { action: 'no_booking' };
    }

    await prisma.booking.update({
      where: { id: activeBooking.id },
      data: { status: 'completed' }
    });

    // Update worker stats
    await prisma.workerProfile.update({
      where: { user_id: user.id },
      data: {
        total_jobs_completed: { increment: 1 },
        last_job_completed_at: new Date(),
      }
    });

    const feePct = activeBooking.assigned_worker?.worker_profile?.cooperative?.fee_percentage || 8.5;
    const workerPayout = Math.round(activeBooking.price * (1 - feePct / 100) * 100) / 100;
    await sendJobCompleted(phone, workerPayout);
    return { action: 'completed', bookingId: activeBooking.id };
  }

  // Unknown command
  await sendMessage(phone, 'Commands: 1 (accept job), 2 (decline job), START (begin job), DONE (finish job).');
  return { action: 'unknown_command' };
}

module.exports = {
  sendMessage,
  sendJobOffer,
  sendJobAccepted,
  sendJobCompleted,
  processIncomingMessage,
};

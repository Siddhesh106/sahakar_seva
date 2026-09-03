const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api/v1';

// In-browser master state for standalone cloud prototype deployment
const MOCK_STORAGE_KEY = 'sahakarseva_prototype_state';

function getMockState() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  
  const initial = {
    user: {
      id: 'user-cust-001',
      name: 'Rahul Sharma',
      phone: '9000000001',
      role: 'customer',
      language_pref: 'en',
    },
    bookings: [
      {
        id: 'bk-99281',
        category: { name: 'electrical' },
        address_text: '12 MG Road, Shivajinagar, Pune',
        price: 350,
        status: 'in_progress',
        scheduled_time: new Date().toISOString(),
        assigned_worker: {
          name: 'Ramesh Patil',
          phone: '9000000013',
          worker_profile: { rating_avg: 4.9, total_jobs_completed: 48 },
        },
      },
      {
        id: 'bk-88219',
        category: { name: 'cleaning' },
        address_text: '45 FC Road, Deccan, Pune',
        price: 300,
        status: 'completed',
        scheduled_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        assigned_worker: {
          name: 'Sunita Kamble',
          phone: '9000000014',
          worker_profile: { rating_avg: 5.0, total_jobs_completed: 32 },
        },
        payment: { status: 'success', txn_id: 'UPI-TXN-88219' },
      },
    ],
    workers: [
      {
        user_id: 'user-work-001',
        user: { name: 'Ramesh Patil', phone: '9000000013' },
        skill_categories: ['electrical', 'plumbing'],
        kyc_doc_type: 'aadhaar',
        kyc_doc_number: '5432 9876 1234',
        kyc_doc_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
        kyc_status: 'verified',
      },
      {
        user_id: 'user-work-002',
        user: { name: 'Sunita Kamble', phone: '9000000014' },
        skill_categories: ['cleaning', 'cooking'],
        kyc_doc_type: 'pan',
        kyc_doc_number: 'ABCDE1234F',
        kyc_doc_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
        kyc_status: 'verified',
      },
      {
        user_id: 'user-work-003',
        user: { name: 'Anand Shinde', phone: '9000000015' },
        skill_categories: ['gardening'],
        kyc_doc_type: 'voter_id',
        kyc_doc_number: 'MH/2026/8892',
        kyc_doc_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
        kyc_status: 'pending',
      },
    ],
    disputes: [
      {
        id: 'disp-001',
        booking_id: 'bk-88219',
        raised_by: 'user-cust-001',
        reason: 'Service delay of 15 minutes due to rain',
        status: 'resolved',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    ledger: [
      {
        id: 'ps-q3-2026',
        period_label: '2026-Q3',
        total_surplus: 15750,
        distributed_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    ],
    walletBalance: 4250.0,
    creditLimit: 15000,
    creditUsed: 2500,
    eshramLinked: true,
    workerOnline: true,
  };
  saveMockState(initial);
  return initial;
}

function saveMockState(state) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function handleMockResponse(endpoint, options = {}) {
  const state = getMockState();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth: OTP Request
  if (endpoint === '/auth/otp/request') {
    return { success: true, message: 'OTP sent: 123456' };
  }

  // Auth: OTP Verify
  if (endpoint === '/auth/otp/verify') {
    const phone = body.phone || '9000000001';
    let user;
    if (phone === '9000000013') {
      user = {
        id: 'user-work-001',
        name: 'Ramesh Patil',
        phone: '9000000013',
        role: 'worker',
        language_pref: 'mr',
        worker_profile: {
          kyc_status: 'verified',
          kyc_doc_type: 'aadhaar',
          kyc_doc_number: '5432 9876 1234',
          kyc_doc_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
          rating_avg: 4.9,
          total_jobs_completed: 48,
          availability_status: state.workerOnline ? 'online' : 'offline',
          skill_categories: ['electrical', 'plumbing'],
        },
      };
    } else if (phone === '9000000099') {
      user = {
        id: 'user-admin-001',
        name: 'Sanjay Desai',
        phone: '9000000099',
        role: 'coop_admin',
        language_pref: 'en',
      };
    } else {
      user = {
        id: 'user-cust-001',
        name: 'Rahul Sharma',
        phone,
        role: 'customer',
        language_pref: 'en',
      };
    }
    state.user = user;
    saveMockState(state);
    return { token: 'mock-token-' + Date.now(), user, isNewUser: false };
  }

  // Auth: Register
  if (endpoint === '/auth/register') {
    const user = {
      id: 'user-' + Date.now(),
      name: body.name || 'Coop Member',
      phone: state.user?.phone || '9000000001',
      role: body.role || 'customer',
      language_pref: body.language_pref || 'en',
    };
    state.user = user;
    saveMockState(state);
    return { token: 'mock-token-' + Date.now(), user };
  }

  // User: Me
  if (endpoint === '/users/me') {
    if (method === 'PUT') {
      state.user = { ...state.user, ...body };
      saveMockState(state);
      return { user: state.user };
    }
    return { user: state.user };
  }

  // AI Parse Request
  if (endpoint === '/ai/parse-request') {
    const text = (body.text || '').toLowerCase();
    let cat = 'electrical';
    if (text.includes('clean') || text.includes('maid') || text.includes('sweep') || text.includes('wash')) cat = 'cleaning';
    if (text.includes('plumb') || text.includes('pipe') || text.includes('tap') || text.includes('leak')) cat = 'plumbing';
    if (text.includes('tutor') || text.includes('teach') || text.includes('math') || text.includes('class')) cat = 'tutoring';
    if (text.includes('cook') || text.includes('food') || text.includes('meal') || text.includes('chef')) cat = 'cooking';
    if (text.includes('garden') || text.includes('plant') || text.includes('grass')) cat = 'gardening';
    if (text.includes('elder') || text.includes('senior') || text.includes('care') || text.includes('nurse')) cat = 'elder_care';
    return { category: cat, confidence: 0.96, notes: body.text || 'Home service request', urgency: 'normal' };
  }

  // Bookings: List & Create
  if (endpoint.startsWith('/bookings')) {
    if (method === 'POST') {
      const newBooking = {
        id: 'bk-' + Math.floor(10000 + Math.random() * 90000),
        category: { name: body.category_id || 'cleaning' },
        address_text: body.address_text || '12 MG Road, Pune',
        price: body.category_id === 'tutoring' ? 500 : body.category_id === 'plumbing' ? 400 : 350,
        status: 'matching',
        scheduled_time: body.scheduled_time || new Date().toISOString(),
        assigned_worker: {
          name: 'Ramesh Patil',
          phone: '9000000013',
          worker_profile: { rating_avg: 4.9, total_jobs_completed: 48 },
        },
      };
      state.bookings.unshift(newBooking);
      saveMockState(state);
      return { booking: newBooking };
    }
    
    // Status update (e.g. PUT /bookings/:id/status)
    if (method === 'PUT') {
      const singleMatch = endpoint.match(/\/bookings\/([^\/\?]+)/);
      if (singleMatch) {
        const bId = singleMatch[1];
        const target = state.bookings.find((b) => b.id === bId);
        if (target && body.status) {
          target.status = body.status;
          saveMockState(state);
          return { booking: target };
        }
      }
    }

    const singleMatch = endpoint.match(/\/bookings\/([^\/\?]+)/);
    if (singleMatch) {
      const bId = singleMatch[1];
      const found = state.bookings.find((b) => b.id === bId) || state.bookings[0];
      // Auto transition requested/matching to assigned after viewing
      if (found.status === 'matching' || found.status === 'requested') {
        found.status = 'assigned';
        saveMockState(state);
      }
      return { booking: found };
    }
    return { bookings: state.bookings };
  }

  // Payments
  if (endpoint.startsWith('/payments')) {
    const singleMatch = endpoint.match(/\/payments\/([^\/\?]+)/);
    if (singleMatch) {
      return { payment: { status: 'success', txn_id: 'UPI-TXN-' + Date.now() } };
    }
    return { success: true, payment: { status: 'success', txn_id: 'UPI-TXN-' + Date.now() } };
  }

  // Ratings
  if (endpoint.startsWith('/ratings')) {
    if (endpoint.includes('/received')) {
      return {
        ratings: [
          { id: 'r1', stars: 5, comment: 'Punctual, professional and great work!', created_at: new Date().toISOString() },
          { id: 'r2', stars: 5, comment: 'Fair price and cooperative member quality.', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: 'r3', stars: 4, comment: 'Good job completed quickly.', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        ],
      };
    }
    return { success: true, message: 'Rating submitted' };
  }

  // Disputes
  if (endpoint.startsWith('/disputes')) {
    if (method === 'PUT') {
      const singleMatch = endpoint.match(/\/disputes\/([^\/\?]+)/);
      if (singleMatch) {
        const dId = singleMatch[1];
        const disp = state.disputes.find((d) => d.id === dId);
        if (disp) {
          disp.status = 'resolved';
          disp.resolution_notes = body.resolution_notes;
          saveMockState(state);
          return { dispute: disp };
        }
      }
    }
    return { disputes: state.disputes };
  }

  // Coop Stats
  if (endpoint.includes('/stats')) {
    return {
      active_workers: state.workers.filter((w) => w.kyc_status === 'verified').length,
      total_workers: state.workers.length,
      jobs_in_progress: state.bookings.filter((b) => b.status === 'in_progress' || b.status === 'assigned').length,
      open_disputes: state.disputes.filter((d) => d.status === 'open').length,
      pending_kyc: state.workers.filter((w) => w.kyc_status === 'pending').length,
      total_jobs_completed: 148,
    };
  }

  // Coop Members & Worker Verification
  if (endpoint.includes('/verify-worker/')) {
    const singleMatch = endpoint.match(/\/verify-worker\/([^\/\?]+)/);
    if (singleMatch) {
      const wId = singleMatch[1];
      const targetWorker = state.workers.find((w) => w.user_id === wId);
      if (targetWorker && body.kyc_status) {
        targetWorker.kyc_status = body.kyc_status;
        saveMockState(state);
        return { success: true, worker_profile: targetWorker };
      }
    }
    return { success: true };
  }

  if (endpoint.includes('/members')) {
    return { workers: state.workers };
  }

  // Coop Profit Share
  if (endpoint.includes('/profit-share/distribute')) {
    const distributed = {
      id: 'ps-' + Date.now(),
      period_label: body.period_label || '2026-Q4',
      total_surplus: body.amount || 15750,
      distributed_at: new Date().toISOString(),
    };
    state.ledger.unshift(distributed);
    state.walletBalance += 1050; // Credit worker balance
    saveMockState(state);
    return {
      success: true,
      per_member_dividend: 1050,
      member_count: state.workers.length,
      total_surplus: 15750,
    };
  }

  if (endpoint.includes('/profit-share')) {
    return {
      ledger: state.ledger,
      current_period: {
        period_label: '2026-Q4',
        total_surplus: 15750,
        total_payments: state.bookings.length,
        member_count: state.workers.length,
      },
    };
  }

  // Worker Earnings
  if (endpoint.includes('/earnings')) {
    return {
      wallet_balance: state.walletBalance,
      total_jobs_completed: 48,
      history: [
        {
          id: 'h-1',
          booking_id: 'bk-99281',
          price: 350,
          worker_payout: 320.25,
          platform_fee: 29.75,
          completed_at: new Date().toISOString(),
          category: 'Electrical Works',
        },
        {
          id: 'h-2',
          booking_id: 'bk-88219',
          price: 400,
          worker_payout: 366.0,
          platform_fee: 34.0,
          completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          category: 'Plumbing Repair',
        },
      ],
    };
  }

  // Worker Availability Toggle
  if (endpoint.includes('/availability')) {
    if (body.status) {
      state.workerOnline = body.status === 'online';
      saveMockState(state);
    }
    return { worker_profile: { availability_status: state.workerOnline ? 'online' : 'offline' } };
  }

  // Worker Skills Update
  if (endpoint.includes('/skills')) {
    return { worker_profile: { skill_categories: body.skill_categories || ['electrical'] } };
  }

  // Worker KYC Upload
  if (endpoint.includes('/workers/kyc')) {
    const existing = state.workers.find((w) => w.user_id === 'user-work-001');
    if (existing) {
      existing.kyc_status = 'pending';
      existing.kyc_doc_number = body.doc_number;
      existing.kyc_doc_type = body.doc_type;
      existing.kyc_doc_image_url = body.doc_image_url;
      saveMockState(state);
    }
    return { kyc_status: 'pending' };
  }

  // Social Security: e-Shram & PACS
  if (endpoint.includes('/pacs-credit-request')) {
    const amt = parseFloat(body.amount) || 1000;
    state.walletBalance += amt;
    state.creditUsed += amt;
    saveMockState(state);
    return {
      success: true,
      message: `₹${amt} credited to cooperative wallet via PACS micro-credit`,
      wallet_balance: state.walletBalance,
      remaining_credit_limit: state.creditLimit - state.creditUsed,
    };
  }

  if (endpoint.includes('/eshram-link')) {
    state.eshramLinked = true;
    saveMockState(state);
    return { success: true, eshram_uan: 'UAN-9921-4482-1092', message: 'e-Shram successfully linked!' };
  }

  if (endpoint.includes('/social-security')) {
    return {
      eshram_status: state.eshramLinked ? 'linked' : 'not_linked',
      eshram_uan: state.eshramLinked ? 'UAN-9921-4482-1092' : null,
      pacs_linked: true,
      credit_limit: state.creditLimit - state.creditUsed,
      credit_used: state.creditUsed,
    };
  }

  // Match Pending / Actions (Accept / Decline)
  if (endpoint.includes('/accept')) {
    return { success: true, message: 'Job accepted. Customer notified.' };
  }
  if (endpoint.includes('/decline')) {
    return { success: true, message: 'Job declined. Forwarded to next candidate.' };
  }

  if (endpoint.includes('/match')) {
    return {
      offer: {
        id: 'off-992',
        booking_id: 'bk-99281',
        expires_at: new Date(Date.now() + 85000).toISOString(),
        booking: {
          category: { name: 'electrical' },
          address_text: '12 MG Road, Shivajinagar, Pune',
          price: 350,
        },
      },
    };
  }

  // Fallback
  return { success: true };
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (!endpoint.startsWith('/auth/')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    // If static server returns 404/405 (no backend server connected on this domain), use graceful in-browser state
    if (response.status === 404 || response.status === 405) {
      console.warn(`[SahakarSeva] Backend returned HTTP ${response.status} for ${endpoint}. Using standalone prototype engine.`);
      return handleMockResponse(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Something went wrong`);
    }
    return data;
  } catch (err) {
    // If network request failed entirely (e.g. offline or relative URL on static hosting)
    if (!API_BASE || err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
      console.warn(`[SahakarSeva] Fetch failed for ${endpoint}. Using standalone prototype engine.`);
      return handleMockResponse(endpoint, options);
    }
    throw err;
  }
}

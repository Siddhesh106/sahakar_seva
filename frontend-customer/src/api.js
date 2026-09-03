const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api/v1';

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
      // Clear token on 401 Unauthorized if not on public auth endpoints
      if (!endpoint.startsWith('/auth/')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Something went wrong`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}


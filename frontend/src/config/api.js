// API Configuration - uses environment variables or falls back to defaults
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const API_SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

/** Remove auth from both storages (call before saving a new session) */
export function clearAllClientAuthKeys() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
}

function decodeJwtExp(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return -1;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) base64 += '='.repeat(4 - pad);
        const payload = JSON.parse(atob(base64));
        return typeof payload.exp === 'number' ? payload.exp : 0;
    } catch {
        return -1;
    }
}

/**
 * Token may live in localStorage (remember me) or sessionStorage.
 * If both hold different tokens (bug: login did not clear the other store),
 * prefer the JWT with the later exp so API calls use the fresh token.
 */
export function getAuthToken() {
    const local = localStorage.getItem('token')?.trim() || null;
    const session = sessionStorage.getItem('token')?.trim() || null;
    if (!local && !session) return null;
    if (!local) return session;
    if (!session) return local;
    if (local === session) return local;
    const el = decodeJwtExp(local);
    const es = decodeJwtExp(session);
    if (es > el) return session;
    if (el > es) return local;
    return session;
}

export function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Normalize /user/me and similar responses to a flat user object */
export function normalizeUserPayload(data) {
    if (!data) return null;
    const inner = data.user ?? data;
    if (!inner || typeof inner !== 'object') return null;
    const { _id, id, name, email } = inner;
    return {
        id: id ?? _id,
        name: name ?? '',
        email: email ?? '',
    };
}

export default {
    API_BASE_URL,
    API_SERVER,
    clearAllClientAuthKeys,
    getAuthToken,
    getAuthHeaders,
    normalizeUserPayload,
};

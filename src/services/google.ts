// Google OAuth Device Flow + minimal API wrapper for Jules integration
// Stores OAuth tokens in Surreal secrets: 'google_oauth' (JSON) and legacy 'google_token' (access token only)
import { getSecret, setSecret } from '@/services/surreal';

type GoogleOAuth = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number; // seconds
  obtained_at?: number; // epoch ms when stored
};

async function getOAuth(): Promise<GoogleOAuth | undefined> {
  try {
    const res = await getSecret('google_oauth');
    const val = (res.result?.[0]?.value ?? res.result?.value) as string | undefined;
    if (!val) return undefined;
    try { return JSON.parse(val) as GoogleOAuth; } catch { return undefined; }
  } catch { return undefined; }
}

async function getLegacyToken(): Promise<string | undefined> {
  try {
    const res = await getSecret('google_token');
    const val = (res.result?.[0]?.value ?? res.result?.value) as string | undefined;
    return val;
  } catch { return undefined; }
}

export async function hasGoogleAuth(): Promise<boolean> {
  const oauth = await getOAuth();
  if (oauth?.access_token) return true;
  const legacy = await getLegacyToken();
  return !!legacy;
}

async function saveOAuth(oauth: GoogleOAuth) {
  const withTime = { ...oauth, obtained_at: Date.now() };
  await setSecret('google_oauth', JSON.stringify(withTime));
  if (withTime.access_token) await setSecret('google_token', withTime.access_token); // backward compat
}

function isExpired(oauth?: GoogleOAuth): boolean {
  if (!oauth?.expires_in || !oauth.obtained_at) return false; // unknown, try until 401
  const expiresAt = oauth.obtained_at + oauth.expires_in * 1000 - 60_000; // refresh 60s early
  return Date.now() > expiresAt;
}

async function getAccessToken(): Promise<string | undefined> {
  const oauth = await getOAuth();
  if (oauth?.access_token && !isExpired(oauth)) return oauth.access_token;
  if (oauth?.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(oauth.refresh_token);
      return refreshed?.access_token;
  } catch (e) { void e; }
  }
  return getLegacyToken();
}

// Device flow endpoints
// https://developers.google.com/identity/protocols/oauth2/limited-input-device
type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_url: string; // e.g., https://www.google.com/device
  expires_in: number;
  interval?: number;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
};

export async function beginGoogleDeviceFlow(scopes: string = 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/gmail.send'):
  Promise<DeviceCodeResponse> {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID for Google device flow');
  const res = await fetch('https://oauth2.googleapis.com/device/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, scope: scopes }).toString(),
  });
  if (!res.ok) throw new Error(`Google device code error ${res.status}`);
  return (await res.json()) as DeviceCodeResponse;
}

export async function pollGoogleDeviceToken(device_code: string, intervalSec = 5): Promise<GoogleOAuth> {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID for Google device flow');
  const start = Date.now();
  for (;;) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }).toString(),
    });
    if (!res.ok) throw new Error(`Google token error ${res.status}`);
    const json = (await res.json()) as TokenResponse;
    if (json.access_token) {
      const oauth: GoogleOAuth = {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_in: json.expires_in,
        token_type: json.token_type,
        scope: json.scope,
      };
      await saveOAuth(oauth);
      return oauth;
    }
  if (json.error === 'slow_down') intervalSec += 5;
  else if (json.error === 'authorization_pending') {
      // keep polling
    } else if (json.error) {
      throw new Error(json.error);
    }
    if (Date.now() - start > 10 * 60 * 1000) throw new Error('Google device flow timed out');
    await new Promise((r) => setTimeout(r, intervalSec * 1000));
  }
}

export async function refreshAccessToken(refresh_token: string): Promise<GoogleOAuth | undefined> {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID for Google token refresh');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token,
    }).toString(),
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as TokenResponse;
  if (json.access_token) {
    const prev = await getOAuth();
    const next: GoogleOAuth = {
      access_token: json.access_token,
      refresh_token: prev?.refresh_token || undefined,
      expires_in: json.expires_in,
      token_type: json.token_type,
      scope: json.scope || prev?.scope,
    };
    await saveOAuth(next);
    return next;
  }
  return undefined;
}

async function gFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Google auth not configured');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  if (init.body && !('Content-Type' in (init.headers || {}))) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { ...init, headers: { ...headers, ...(init.headers as any) } });
  if (res.status === 401) {
    const oauth = await getOAuth();
    if (oauth?.refresh_token) {
      const refreshed = await refreshAccessToken(oauth.refresh_token);
      if (refreshed?.access_token) {
        const retry = await fetch(path, { ...init, headers: { ...headers, 'Authorization': `Bearer ${refreshed.access_token}`, ...(init.headers as any) } });
        if (!retry.ok) throw new Error(`Google API error ${retry.status}`);
        return retry.json();
      }
    }
  }
  if (!res.ok) throw new Error(`Google API error ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Minimal APIs for Jules
export async function getGoogleUserInfo() {
  return gFetch('https://www.googleapis.com/oauth2/v3/userinfo');
}

export async function listDriveFiles(q?: string) {
  const params = new URLSearchParams({ pageSize: '20', fields: 'files(id,name,mimeType,modifiedTime,owners)', includeItemsFromAllDrives: 'true', supportsAllDrives: 'true' });
  if (q) params.set('q', q);
  return gFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
}

export async function signOutGoogle() {
  await setSecret('google_oauth', '');
  await setSecret('google_token', '');
}

// Minimal GitHub REST client using fetch; uses a stored PAT or OAuth token in Surreal secrets.
// No mocks; only real calls when invoked.
import { getSecret, setSecret } from "@/services/surreal";
import { invoke } from "@tauri-apps/api/tauri";
import { isTauri } from "./platform";

// In-memory token cache with localStorage fallback to survive Surreal outages
let memToken: string | undefined;

const API = 'https://api.github.com';

async function getToken(): Promise<string | undefined> {
  if (memToken) return memToken;
  try {
    const res = await getSecret('github_token');
    const value = (res.result?.[0]?.value ?? res.result?.value) as string | undefined;
    if (value) {
      memToken = value;
    try { localStorage.setItem('github_token', value); } catch (e) { void e; }
      return value;
    }
  } catch (e) { void e; }
  try {
    const v = localStorage.getItem('github_token') || undefined;
    if (v) { memToken = v; return v; }
  } catch (e) { void e; }
  return undefined;
}

async function ghFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['X-GitHub-Api-Version'] = '2022-11-28';
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...(init.headers as any) } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function getRepoIssues(repo: string, state: 'open' | 'closed' | 'all' = 'open') {
  return ghFetch(`/repos/${repo}/issues?state=${state}&per_page=50`);
}

export async function createIssue(repo: string, title: string, body?: string, labels?: string[]) {
  return ghFetch(`/repos/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateIssue(repo: string, number: number, patch: Record<string, any>) {
  return ghFetch(`/repos/${repo}/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function createIssueComment(repo: string, number: number, body: string) {
  return ghFetch(`/repos/${repo}/issues/${number}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function setIssueLabels(repo: string, number: number, labels: string[]) {
  return ghFetch(`/repos/${repo}/issues/${number}/labels`, {
    method: 'PUT',
    body: JSON.stringify({ labels }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getUser() {
  return ghFetch('/user');
}

export async function getIssueComments(repo: string, number: number) {
  return ghFetch(`/repos/${repo}/issues/${number}/comments?per_page=50`);
}

export async function addIssueComment(repo: string, number: number, body: string) {
  return ghFetch(`/repos/${repo}/issues/${number}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

// --- Auth helpers ---
export async function hasGitHubToken(): Promise<boolean> {
  const t = await getToken();
  return !!t;
}

export async function signOutGitHub() {
  // Clear token by setting empty string; or a dedicated delete if implemented later
  try { await setSecret('github_token', ''); } catch (e) { void e; }
  try { localStorage.removeItem('github_token'); } catch (e) { void e; }
  memToken = undefined;
}

// GitHub Device Flow (no secret client): requires VITE_GITHUB_CLIENT_ID
// Ref: https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval?: number;
};

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
};

export async function beginDeviceFlow(scopes: string = 'repo read:user'): Promise<DeviceCodeResponse> {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing VITE_GITHUB_CLIENT_ID. See README → GitHub Device Flow setup and set it in .env.local, then restart dev server.');
  }

  if (isTauri()) {
    // Use the Tauri IPC to call the Rust backend
    return await invoke('begin_github_device_flow', { clientId });
  } else {
    // Use the standalone proxy server for the web environment
    const res = await fetch('http://localhost:3001/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, scope: 'repo,user' }),
    });

    if (!res.ok) {
      throw new Error('Failed to start device flow');
    }
    return await res.json();
  }
}

/**
 * Polls the GitHub Device Flow token endpoint until an access token is received.
 * @param deviceCode The device code received from the initial device authorization request.
 * @param clientId The GitHub App's client ID.
 * @returns A promise that resolves with the access token response.
 */
export async function pollDeviceToken(deviceCode: string, clientId:string): Promise<any> {
  const poll = async (): Promise<any> => {
    let res: any;
    if (isTauri()) {
      res = await invoke('poll_github_device_token', {
        clientId,
        deviceCode,
        grantType: 'urn:ietf:params:oauth:grant-type:device_code',
      });
    } else {
      const response = await fetch('http://localhost:3001/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });
      res = await response.json();
    }

    if (res.error) {
      if (res.error === 'authorization_pending') {
        // Continue polling
        return await new Promise(resolve => setTimeout(resolve, 5000)).then(poll);
      }
      throw new Error(`Failed to poll for token: ${res.error_description}`);
    }

    if (res.access_token) {
      // For web, we can't store secrets securely, so we just keep it in memory
      memToken = res.access_token;
    }
    return res;
  };

  // Initial poll, then retry every interval seconds
  return poll();
}

// --- Repo/org/branch APIs ---
export async function listViewerRepos(options?: { affiliation?: string; per_page?: number; q?: string }): Promise<any[]> {
  const aff = options?.affiliation || 'owner,collaborator,organization_member';
  const per = options?.per_page || 100;
  const params = new URLSearchParams({
    per_page: String(per),
    affiliation: aff,
    sort: 'updated',
  });
  if (options?.q) {
    // This is not a direct API param for this endpoint, so we'll have to filter client-side.
    // A better approach would be to use the search API, but this is a quick fix.
    const allRepos = await ghFetch(`/user/repos?${params.toString()}`);
    return allRepos.filter((r: any) => r.full_name.toLowerCase().includes(options.q?.toLowerCase()));
  }
  return ghFetch(`/user/repos?${params.toString()}`);
}

export async function listUserOrgs(): Promise<any[]> {
  return ghFetch(`/user/orgs?per_page=100`);
}

export async function listOrgRepos(org: string, options?: { per_page?: number, q?: string }): Promise<any[]> {
  const per = options?.per_page || 100;
  const params = new URLSearchParams({
    per_page: String(per),
    type: 'all',
    sort: 'updated',
  });
  if (options?.q) {
    // Similar to listViewerRepos, we filter client-side.
    const allRepos = await ghFetch(`/orgs/${org}/repos?${params.toString()}`);
    return allRepos.filter((r: any) => r.name.toLowerCase().includes(options.q?.toLowerCase()));
  }
  return ghFetch(`/orgs/${org}/repos?${params.toString()}`);
}

export async function getRepo(repo: string) {
  return ghFetch(`/repos/${repo}`);
}

export async function listBranches(repo: string): Promise<any[]> {
  return ghFetch(`/repos/${repo}/branches?per_page=100`);
}

export async function listPullRequests(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
  return ghFetch(`/repos/${repo}/pulls?state=${state}&per_page=50`);
}

export async function createRepoForUser(payload: { name: string; description?: string; private?: boolean; auto_init?: boolean; }): Promise<any> {
  return ghFetch(`/user/repos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createRepoForOrg(org: string, payload: { name: string; description?: string; private?: boolean; auto_init?: boolean; }): Promise<any> {
  return ghFetch(`/orgs/${org}/repos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

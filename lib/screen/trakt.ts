import { pgQuery } from './db';

const TRAKT_BASE_URL = 'https://api.trakt.tv';

interface TraktTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

export async function getTraktAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
  const redirectUri = process.env.TRAKT_REDIRECT_URI;
  return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}`;
}

export async function exchangeTraktCode(code: string) {
  const response = await fetch(`${TRAKT_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({
      code,
      client_id: process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
      client_secret: process.env.TRAKT_CLIENT_SECRET,
      redirect_uri: process.env.TRAKT_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Trakt OAuth Error:", errorBody);
    throw new Error(`Failed to exchange Trakt code: ${response.statusText}`);
  }
  const data: TraktTokenResponse = await response.json();
  
  await saveTraktToken(data);
  return data;
}

async function saveTraktToken(data: TraktTokenResponse) {
  const expiresAt = new Date((data.created_at + data.expires_in) * 1000);
  await pgQuery(`
    INSERT INTO api_auth (provider, access_token, refresh_token, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (provider) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token, 
      refresh_token = EXCLUDED.refresh_token, 
      expires_at = EXCLUDED.expires_at,
      updated_at = CURRENT_TIMESTAMP;
  `, ['trakt', data.access_token, data.refresh_token, expiresAt]);
}

export async function getValidTraktToken() {
  const res = await pgQuery(`SELECT * FROM api_auth WHERE provider = 'trakt'`);
  if (res.rows.length === 0) throw new Error('No Trakt token found in DB. Please authenticate.');

  const auth = res.rows[0];
  const isExpired = new Date(auth.expires_at) <= new Date();

  if (isExpired) {
    console.log('Trakt token expired, refreshing...');
    const response = await fetch(`${TRAKT_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        refresh_token: auth.refresh_token,
        client_id: process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
        client_secret: process.env.TRAKT_CLIENT_SECRET,
        redirect_uri: process.env.TRAKT_REDIRECT_URI,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) throw new Error('Failed to refresh Trakt token');
    const data: TraktTokenResponse = await response.json();
    await saveTraktToken(data);
    return data.access_token;
  }

  return auth.access_token;
}

export async function fetchTraktHistory(limit = 100, page = 1): Promise<TraktHistoryItem[]> {
  const token = await getValidTraktToken();
  const response = await fetch(
    `${TRAKT_BASE_URL}/sync/history?limit=${limit}&page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    },
  );

  if (!response.ok) throw new Error(`Failed to fetch Trakt history: ${response.statusText}`);
  return response.json();
}
export async function isTraktAuthenticated() {
  const res = await pgQuery(`SELECT 1 FROM api_auth WHERE provider = 'trakt'`);
  return res.rows.length > 0;
}

export async function fetchTraktRatings(
  type: "movies" | "shows" | "episodes",
): Promise<TraktRatingItem[]> {
  const token = await getValidTraktToken();
  const response = await fetch(`${TRAKT_BASE_URL}/sync/ratings/${type}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok)
    throw new Error(`Failed to fetch Trakt ratings: ${response.statusText}`);
  return response.json();
}





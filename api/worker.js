// Optional Cloudflare Worker for public avatar data and private Spotify activity.
// Secrets belong in Worker environment variables, never the static website.
const json = (body, status = 200, origin = '') => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}) } });
const allowedOrigin = origin => origin === 'https://ykada.com' || origin === 'https://www.ykada.com' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const parse = async response => { if (!response.ok) throw Error(`upstream ${response.status}`); return response.json(); };
const robloxAsset = raw => { const u = new URL(raw); if (u.protocol !== 'https:' || !(u.hostname === 'rbxcdn.com' || u.hostname.endsWith('.rbxcdn.com') || u.hostname === 'assetdelivery.roblox.com' || u.hostname === 'thumbnails.roblox.com')) throw Error('Asset host not allowed'); return u.href; };
const track = item => item && ({ title: item.name, artist: item.artists?.map(a => a.name).join(', ') || '', url: item.external_urls?.spotify || '', image: item.album?.images?.[0]?.url || '' });

async function spotifyActivity(env) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) return null;
  const auth = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const token = await parse(await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }) }));
  const headers = { Authorization: `Bearer ${token.access_token}` };
  const current = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
  if (current.status === 200) { const data = await current.json(); if (data.is_playing && data.item) return { ...track(data.item), isPlaying: true }; }
  const top = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=1', { headers });
  if (top.ok) { const data = await top.json(); if (data.items?.[0]) return { ...track(data.items[0]), isPlaying: false }; }
  return null;
}

async function discordActivity(env) {
  if (!/^\d{15,22}$/.test(env.DISCORD_USER_ID || '')) return null;
  const response = await fetch(`https://api.lanyard.rest/v1/users/${env.DISCORD_USER_ID}`);
  if (!response.ok) return null;
  const data = (await response.json()).data;
  const game = data?.activities?.find(a => a.type === 0);
  return game ? { name: game.name, active: true } : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url), origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigin(origin) ? origin : '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': corsOrigin, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, corsOrigin);
    try {
      if (url.pathname === '/api/roblox/identity') {
        const username = url.searchParams.get('username'); if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) return json({ error: 'Invalid username' }, 400, corsOrigin);
        const result = await parse(await fetch('https://users.roblox.com/v1/usernames/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }) }));
        const found = result.data?.[0]; if (!found) return json({ error: 'User not found' }, 404, corsOrigin);
        const profile = await parse(await fetch(`https://users.roblox.com/v1/users/${found.id}`));
        return json({ id: profile.id, name: profile.name, displayName: profile.displayName, hasVerifiedBadge: !!profile.hasVerifiedBadge }, 200, corsOrigin);
      }
      if (url.pathname === '/api/roblox/thumbnail' || url.pathname === '/api/roblox/avatar-3d') {
        const id = url.searchParams.get('userId'); if (!/^\d{1,20}$/.test(id || '')) return json({ error: 'Invalid user ID' }, 400, corsOrigin);
        const endpoint = url.pathname.endsWith('thumbnail') ? `https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=420x420&format=Png&isCircular=false` : `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${id}`;
        const response = await fetch(endpoint); if (!response.ok) return json({ error: 'Roblox avatar endpoint unavailable', status: response.status }, 502, corsOrigin);
        const data = await response.json(); return json(url.pathname.endsWith('thumbnail') ? data.data?.[0] || {} : data, 200, corsOrigin);
      }
      if (url.pathname === '/api/roblox/manifest' || url.pathname === '/api/roblox/asset') {
        const target = robloxAsset(url.searchParams.get('url') || '');
        const response = await fetch(target); if (!response.ok) return json({ error: 'Avatar asset unavailable' }, 502, corsOrigin);
        const headers = new Headers({ 'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream', 'Cache-Control': 'public, max-age=300' }); if (corsOrigin) { headers.set('Access-Control-Allow-Origin', corsOrigin); headers.set('Vary', 'Origin'); }
        return new Response(response.body, { status: 200, headers });
      }
      if (url.pathname === '/api/activity') {
        const [music, game] = await Promise.allSettled([spotifyActivity(env), discordActivity(env)]);
        return json({ music: music.status === 'fulfilled' ? music.value : null, game: game.status === 'fulfilled' ? game.value : null }, 200, corsOrigin);
      }
      return json({ error: 'Not found' }, 404, corsOrigin);
    } catch { return json({ error: 'Service temporarily unavailable' }, 502, corsOrigin); }
  }
};

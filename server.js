import crypto from 'node:crypto';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const sessions = new Map();
const port = process.env.PORT || 3001;
const appUrl = process.env.APP_URL || `http://localhost:${port}`;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const botToken = process.env.DISCORD_TOKEN;
const redirectUri = `${appUrl}/api/auth/discord/callback`;

app.use(express.json());

function requireConfig(res) {
  if (!clientId || !clientSecret || !botToken) {
    res.status(503).json({ error: 'Discord OAuth is not configured on the server.' });
    return false;
  }
  return true;
}

function cookieValue(request, name) {
  const cookies = request.headers.cookie?.split(';').map((part) => part.trim()) || [];
  return cookies.find((part) => part.startsWith(`${name}=`))?.split('=')[1];
}

app.get('/api/auth/discord', (request, response) => {
  if (!requireConfig(response)) return;
  const state = crypto.randomBytes(24).toString('hex');
  response.setHeader('Set-Cookie', `stellar_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'identify guilds' });
  response.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get('/api/auth/discord/callback', async (request, response) => {
  const state = cookieValue(request, 'stellar_oauth_state');
  if (!state || !request.query.code) return response.status(400).send('Discord sign-in was cancelled or expired.');
  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code: request.query.code, redirect_uri: redirectUri }),
    });
    if (!tokenResponse.ok) throw new Error('Token exchange failed');
    const token = await tokenResponse.json();
    const headers = { Authorization: `Bearer ${token.access_token}` };
    const [userResponse, guildsResponse, botGuildsResponse] = await Promise.all([fetch('https://discord.com/api/users/@me', { headers }), fetch('https://discord.com/api/users/@me/guilds', { headers }), fetch('https://discord.com/api/users/@me/guilds', { headers: { Authorization: `Bot ${botToken}` } })]);
    if (!userResponse.ok || !guildsResponse.ok || !botGuildsResponse.ok) throw new Error('Discord profile lookup failed');
    const user = await userResponse.json();
    const guilds = await guildsResponse.json();
    const botGuilds = await botGuildsResponse.json();
    const botGuildIds = new Set(botGuilds.map((guild) => guild.id));
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, { user, guilds: guilds.filter((guild) => botGuildIds.has(guild.id) && (guild.owner || (Number(guild.permissions) & 0x20) === 0x20)), expiresAt: Date.now() + 86_400_000 });
    response.setHeader('Set-Cookie', `stellar_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
    response.redirect(frontendUrl);
  } catch (error) {
    console.error(error);
    response.status(502).send('Unable to connect to Discord right now.');
  }
});

app.get('/api/session', (request, response) => {
  const session = sessions.get(cookieValue(request, 'stellar_session'));
  if (!session || session.expiresAt < Date.now()) return response.json({ authenticated: false });
  response.json({ authenticated: true, user: session.user, guilds: session.guilds });
});

app.post('/api/auth/logout', (request, response) => {
  const sessionId = cookieValue(request, 'stellar_session');
  sessions.delete(sessionId);
  response.setHeader('Set-Cookie', 'stellar_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  response.json({ ok: true });
});

app.listen(port, () => console.log(`Stellar auth server running at ${appUrl}`));
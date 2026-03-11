// netlify/functions/strava-token.js
// Handles Strava OAuth token exchange and refresh.
// This runs server-side so the STRAVA_CLIENT_SECRET never reaches the browser.

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers — allow your Netlify domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const clientId     = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Strava credentials not configured on server' }),
    };
  }

  const { code, refresh_token, grant_type } = body;

  // Build request to Strava token endpoint
  const params = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    grant_type:    grant_type || 'authorization_code',
  });

  if (grant_type === 'refresh_token') {
    if (!refresh_token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'refresh_token required' }) };
    }
    params.set('refresh_token', refresh_token);
  } else {
    if (!code) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'code required' }) };
    }
    params.set('code', code);
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Strava token error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.message || 'Strava token exchange failed', details: data }),
      };
    }

    // Return the token data (includes athlete profile on first auth)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Strava function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: err.message }),
    };
  }
};
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { endpoint } = req.query;
    let url = '';

    if (endpoint === 'leaderboard') {
      // Correct leaderboard endpoint with proper params
      url = 'https://data-api.polymarket.com/leaderboard?window=all&limit=50';
    } else if (endpoint === 'leaderboard_volume') {
      url = 'https://data-api.polymarket.com/leaderboard?window=all&limit=50&sort=volume';
    } else if (endpoint === 'positions') {
      const { address } = req.query;
      if (!address) { res.status(400).json({ error: 'Missing address parameter' }); return; }
      url = `https://data-api.polymarket.com/positions?user=${address}&limit=50&sizeThreshold=0`;
    } else if (endpoint === 'value') {
      const { address } = req.query;
      if (!address) { res.status(400).json({ error: 'Missing address parameter' }); return; }
      url = `https://data-api.polymarket.com/value?user=${address}`;
    } else if (endpoint === 'markets') {
      url = 'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=100&order=volume&ascending=false';
    } else if (endpoint === 'check_resolved') {
      url = 'https://gamma-api.polymarket.com/markets?closed=true&limit=20&order=end_date&ascending=false';
    } else if (endpoint === 'trades') {
      const { market, limit } = req.query;
      if (!market) { res.status(400).json({ error: 'Missing market parameter' }); return; }
      url = `https://data-api.polymarket.com/trades?market=${market}&limit=${limit || 200}`;
    } else {
      res.status(400).json({ error: 'Unknown endpoint: ' + endpoint });
      return;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      const body = await response.text();
      res.status(response.status).json({
        error: 'Polymarket API error',
        status: response.status,
        url: url,
        body: body.slice(0, 200)
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  const { ticker, type } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let symbol = ticker.toUpperCase().trim();

    // For crypto, append -USD if not already
    if (type === 'Crypto' && !symbol.includes('-') && !symbol.includes('USD')) {
      symbol = symbol + '-USD';
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: `No data found for ${symbol}` });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: `No data for ${symbol}` });

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose * 100) : 0;

    return res.status(200).json({
      ticker: symbol,
      price: Math.round(price * 10000) / 10000,
      change: Math.round(change * 10000) / 10000,
      changePct: Math.round(changePct * 100) / 100,
      currency: meta.currency || 'USD',
      name: meta.shortName || symbol,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

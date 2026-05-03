export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const queries = [
    'US Federal Reserve interest rate decision 2025',
    'US inflation CPI data latest 2025',
    'S&P 500 market outlook May 2025',
    'gold price central bank purchases 2025',
    'US China trade war tariffs 2025',
    'geopolitical risk Middle East oil 2025',
    'global recession outlook IMF World Bank 2025',
  ];

  async function searchNews(query) {
    try {
      const url = 'https://news.google.com/rss/search?q=' +
        encodeURIComponent(query) + '&hl=en-US&gl=US&ceid=US:en';
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const xml = await resp.text();
      // Extract titles from RSS
      const titles = [];
      const regex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g;
      let m;
      let count = 0;
      while ((m = regex.exec(xml)) !== null && count < 3) {
        const title = (m[1] || m[2] || '').trim();
        if (title && title !== 'Google News' && title.length > 10) {
          titles.push(title);
          count++;
        }
      }
      return titles;
    } catch(e) {
      return [];
    }
  }

  try {
    // Run all searches in parallel
    const results = await Promise.all(queries.map(q => searchNews(q)));

    const categories = [
      { label: 'Fed & Interest Rates', headlines: results[0] },
      { label: 'Inflation & CPI',       headlines: results[1] },
      { label: 'Equity Markets',        headlines: results[2] },
      { label: 'Gold & Central Banks',  headlines: results[3] },
      { label: 'Trade & Tariffs',       headlines: results[4] },
      { label: 'Geopolitical Risk',     headlines: results[5] },
      { label: 'Global Macro',          headlines: results[6] },
    ];

    let summary = 'CURRENT MARKET INTELLIGENCE (live as of today):\n\n';
    categories.forEach(cat => {
      if (cat.headlines.length) {
        summary += cat.label + ':\n';
        cat.headlines.forEach(h => { summary += '• ' + h + '\n'; });
        summary += '\n';
      }
    });

    return res.status(200).json({
      summary,
      fetchedAt: new Date().toISOString(),
      categories: categories.filter(c => c.headlines.length > 0),
    });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}

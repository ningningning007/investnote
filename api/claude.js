export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    try {
      return res.status(response.status).json(JSON.parse(text));
    } catch {
      return res.status(response.status).json({ error: 'Invalid response', raw: text.slice(0,300) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

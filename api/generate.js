const recentRequests = new Map();
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 1200) return res.status(400).json({ error: 'Enter a question under 1,200 characters.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI is not configured yet. Add OPENAI_API_KEY in your Vercel project settings.' });
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (recentRequests.get(ip) || []).filter(time => time > windowStart);
  if (recent.length >= 8) return res.status(429).json({ error: 'Please wait a minute before asking more questions.' });
  recent.push(now);
  recentRequests.set(ip, recent);
  const schema = `Sample ShopSmart tables (fictional practice data):\nproducts(id, name, category, price)\ncustomers(id, name, email, joined_at)\norders(id, customer_id, order_date, status, total)\norder_items(order_id, product_id, quantity, unit_price)\nRelationships: orders.customer_id -> customers.id; order_items.order_id -> orders.id; order_items.product_id -> products.id.`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, max_output_tokens: 750, instructions: `You are QueryQuest AI, a careful SQL learning assistant. Generate SQL only for the supplied fictional schema. Never suggest modifying data or accessing a real database. Return valid JSON with exactly these string keys: sql, explanation, challenge. The challenge key should be a short related practice challenge. Do not claim that SQL has been executed. Schema:\n${schema}`, input: question, text: { format: { type: 'json_object' } } })
    });
    const payload = await response.json();
    if (!response.ok) return res.status(502).json({ error: payload.error?.message || 'The AI service could not complete the request.' });
    const raw = payload.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
    if (!raw) return res.status(502).json({ error: 'The AI returned no text. Please try again.' });
    const result = JSON.parse(raw);
    if (typeof result.sql !== 'string' || typeof result.explanation !== 'string') return res.status(502).json({ error: 'The AI response was incomplete. Please try again.' });
    return res.status(200).json({ sql: result.sql, explanation: result.explanation, challenge: String(result.challenge || '') });
  } catch {
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again.' });
  }
}

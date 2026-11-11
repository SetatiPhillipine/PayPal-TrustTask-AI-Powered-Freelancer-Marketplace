const SYSTEM = `You are a project planner for a freelance marketplace. Turn a client's request into a structured brief.
Respond with ONLY valid JSON, no markdown, in this exact shape:
{"title": string, "summary": string, "deliverables": string[], "milestones": [{"title": string, "description": string, "amount": number, "dueInDays": number}]}
Use 3 to 5 milestones. Milestone amounts are in USD and must add up to the client's budget.`;

function fallback(description, budget) {
  const total = Number(budget) > 0 ? Number(budget) : 300;
  const split = [0.2, 0.4, 0.3, 0.1];
  const names = [
    ['Discovery and plan', 'Confirm requirements, scope and a delivery plan.', 3],
    ['First working version', 'Deliver the core of the project for review.', 10],
    ['Revisions and polish', 'Apply feedback and finish remaining items.', 17],
    ['Final handover', 'Deliver final files and any documentation.', 21],
  ];
  return {
    title: description.split(/[.\n]/)[0].slice(0, 70) || 'New project',
    summary: description.slice(0, 280),
    deliverables: ['Completed work as described in the request', 'Source files', 'Short handover notes'],
    milestones: names.map(([title, d, dueInDays], i) => ({
      title, description: d, dueInDays, amount: Math.round(total * split[i] * 100) / 100,
    })),
  };
}

export async function generateBrief(description, budget) {
  if (!process.env.ANTHROPIC_API_KEY) return { ...fallback(description, budget), source: 'fallback' };
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-5-5',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Budget (USD): ${budget || 'not stated'}\n\nClient request:\n${description}` }],
    }),
  });
  if (!r.ok) throw Object.assign(new Error('The AI service is unavailable right now'), { status: 502 });
  const data = await r.json();
  const text = data.content.map((b) => b.text || '').join('').replace(/```json|```/g, '').trim();
  try { return { ...JSON.parse(text), source: 'ai' }; }
  catch { return { ...fallback(description, budget), source: 'fallback' }; }
}

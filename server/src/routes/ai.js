import { Router } from 'express';
import OpenAI from 'openai';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// 1. Chat Route (Optimized for brevity)
router.post('/chat', requireAuth, async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array is required' });

    // Strict rules to stop the AI from beating around the bush
    const systemPrompt = `You are an expert project manager for TrustTask. Your goal is to extract project requirements quickly and efficiently.
RULES:
1. Be extremely brief. Use a MAXIMUM of 2 short sentences per response.
2. Do NOT use filler words like "That sounds great", "I understand", or "I'd be happy to help".
3. Ask ONLY ONE direct question at a time.
4. Do not ask for information the user has already provided.
5. Once you have: (1) what the site is for, (2) the style they want, and (3) key pages/features, STOP asking questions.
6. When you have enough info, reply exactly: "I have enough details. Click 'Generate Final Brief' below."
7. NEVER use asterisks (*), bold (**), or any markdown formatting in your replies. Use plain text only.`;

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'openai/gpt-oss-120b',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 150, // Physically limits the AI to short answers
      temperature: 0.3, // Makes the AI more focused and less creative/chatty
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Chat Error:', error);
    next(error);
  }
});

// 2. Generate Brief Route
router.post('/brief', requireAuth, async (req, res, next) => {
  try {
    const { messages } = req.body;

    // Strict JSON rules
    const systemPrompt = `You are a professional project manager for TrustTask.
Given the conversation, output a structured JSON project brief.
The JSON MUST have this exact structure:
{
  "title": "A short, catchy title",
  "summary": "A professional 2-sentence summary",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
  "milestones": [
    { "title": "Milestone 1 Title", "description": "What needs to be done", "amount": 100 },
    { "title": "Milestone 2 Title", "description": "What needs to be done", "amount": 150 }
  ]
}
Return ONLY valid JSON. Do not include markdown formatting, explanations, or any text outside the JSON object.`;

    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the conversation:\n${conversationText}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800, // Enough for the JSON, but prevents rambling
      temperature: 0.2, // Keeps the JSON structure strict and predictable
    });

    // Clean the response in case the AI adds markdown backticks
    let cleanContent = response.choices[0].message.content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const briefData = JSON.parse(cleanContent);
    res.json(briefData);

  } catch (error) {
    console.error('AI Brief Error:', error);
    next(error);
  }
});

export default router;
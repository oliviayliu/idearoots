import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Load .env file manually (avoid extra dependency)
import { readFileSync } from 'fs';
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf-8');
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const client = new Anthropic();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are IdeaRoots, a tool that maps everyday thoughts to philosophical and social science concepts across world traditions.

Given a user's idea, find 4-6 matching concepts. You MUST include non-Western traditions — Chinese, Indian, Buddhist, Islamic, African, Indigenous, and others — alongside Western ones where relevant. Do not default to only Western philosophy.

For each concept, provide:
- name: the concept name in English
- original_term: the term in its original language/script if non-English (e.g. 無為, Ubuntu, Ahimsa), or null if English
- tradition: the philosophical/intellectual tradition (e.g. "Stoic (Greek)", "Daoist (Chinese)", "Yoruba (West African)", "Advaita Vedanta (Indian)")
- explanation: 2-3 sentences explaining the concept in plain language and why it matches the user's idea. Be specific about the connection.
- thinkers: key thinkers associated with this concept (e.g. "Zhuangzi, Laozi" or "Marcus Aurelius, Epictetus")
- closeness: a number from 0 to 1 indicating how close this concept is to the user's idea (1 = near-perfect match)
- is_closest: boolean, true only for the single closest match

Sort by closeness descending (closest first).

Respond ONLY with valid JSON in this exact format:
{
  "concepts": [
    {
      "name": "...",
      "original_term": "..." or null,
      "tradition": "...",
      "explanation": "...",
      "thinkers": "...",
      "closeness": 0.0,
      "is_closest": false
    }
  ]
}`;

app.post('/api/roots', async (req, res) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide an idea.' });
  }

  if (idea.length > 1000) {
    return res.status(400).json({ error: 'Idea must be under 1000 characters.' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: idea.trim() }],
    });

    const text = message.content[0].text;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: 'Failed to find roots. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`IdeaRoots running at http://localhost:${PORT}`);
});

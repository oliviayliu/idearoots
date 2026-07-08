import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Load .env
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf-8');
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('Missing GROQ_API_KEY in .env — get one free at console.groq.com');
  process.exit(1);
}

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are IdeaRoots. Someone just shared a thought with you. Your job: find the one thinker from history — a philosopher, social scientist, or sage — who explored the same idea most deeply. Then find 2-3 more voices from different traditions.

Search across ALL traditions. Do not default to any single region. Use specific geographic and cultural traditions, never vague labels like "Western" or "Eastern."

ACCURACY — non-negotiable:
- Only cite real people, real concepts, and real texts. Never invent.
- Cite specific source texts (e.g. "Zhuangzi, Ch. 2 (Qi Wu Lun)" not just "Zhuangzi").
- If uncertain, say "traditionally attributed to" rather than stating as fact.
- If fewer than 3 strong matches exist, return fewer. Never pad.

SOURCE LINKS — prioritize original-language and accessible sources:
- Chinese texts → https://ctext.org/ (Chinese Text Project)
- Sanskrit/Indian texts → https://www.wisdomlib.org/ or https://www.sacred-texts.com/
- Arabic/Islamic texts → https://al-islam.org/ or Wikipedia
- Greek/Latin texts → https://www.perseus.tufts.edu/ or Wikipedia
- African philosophy → Wikipedia
- General fallback → Wikipedia
Must be a real, existing page. Do not guess URLs.

Return the BEST match first, then others. For each:
- name: concept name in English
- original_term: in original script if non-English (e.g. 無為, रिता, Ubuntu), or null
- tradition: use ONLY from this fixed list. Pick the most specific match:
  "Daoist (Chinese)", "Confucian (Chinese)", "Buddhist (Chinese)", "Legalist (Chinese)",
  "Buddhist (Indian)", "Vedanta (Indian)", "Yoga (Indian)", "Jain (Indian)",
  "Buddhist (Japanese)", "Shinto (Japanese)", "Buddhist (Tibetan)",
  "Sufi (Islamic)", "Kalam (Islamic)", "Falsafa (Islamic)",
  "Stoic (Greek)", "Platonic (Greek)", "Aristotelian (Greek)", "Skeptic (Greek)", "Epicurean (Greek)",
  "Roman", "Norse (Nordic)", "Celtic",
  "Yoruba (West African)", "Bantu (Southern African)", "Ethiopian", "Egyptian (Ancient)",
  "Existentialist (French)", "Phenomenological (German)", "Pragmatist (American)",
  "Analytical Psychology (Swiss)", "Psychoanalytic (Austrian)", "Critical Theory (German)",
  "Scottish Enlightenment", "French Enlightenment", "German Idealist",
  "Marxist", "Feminist", "Postcolonial",
  "Indigenous (Andean)", "Indigenous (Mesoamerican)", "Indigenous (Australian)", "Indigenous (Polynesian)",
  "Korean Confucian", "Persian", "Jewish (Kabbalistic)", "Jewish (Talmudic)"
  If none fit exactly, pick the closest and add a brief qualifier.
- connection_line: a vivid, warm one-liner connecting the user to the thinker. Make the reader feel like they just met someone across time. Include the thinker's name, place, era, and one human detail. e.g. "You share this thought with Zhuangzi, who told stories about butterflies and fish in China 2,300 years ago"
- explanation: 2-3 sentences in warm, conversational language — like telling a friend about something beautiful you just read. Why does this thinker's idea echo theirs? No jargon.
- source_text: the specific text (e.g. "Dao De Jing, Ch. 37", "Meditations, Book V")
- source_url: URL to read the original text (prefer ctext.org, wisdomlib.org, perseus.tufts.edu, sacred-texts.com)
- is_best: true only for the single best match

Respond ONLY with valid JSON:
{
  "best": { "name", "original_term", "tradition", "connection_line", "explanation", "source_text", "source_url", "is_best": true },
  "others": [ { same fields, "is_best": false }, ... ]
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
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: idea.trim() },
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      throw new Error(err.error?.message || 'Groq API error');
    }

    const data = await groqRes.json();
    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to find roots. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`IdeaRoots running at http://localhost:${PORT}`);
});

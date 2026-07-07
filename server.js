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

const MOCK_MODE = !process.env.ANTHROPIC_API_KEY;
const client = MOCK_MODE ? null : new Anthropic();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are IdeaRoots, a tool that maps everyday thoughts to philosophical and social science concepts across world traditions.

Given a user's idea, find 4-6 matching concepts. You MUST include non-Western traditions — Chinese, Indian, Buddhist, Islamic, African, Indigenous, and others — alongside Western ones where relevant. Do not default to only Western philosophy.

ACCURACY RULES — follow strictly:
- Only cite concepts, thinkers, and texts you are highly confident are real and correctly attributed.
- For each concept, cite at least one specific source text (e.g. "Dao De Jing, Ch. 37" not just "Laozi"; "Nicomachean Ethics, Book II" not just "Aristotle").
- If a concept spans multiple thinkers, attribute the specific claim to the right person — do not lump them together.
- If you are uncertain whether a concept or attribution is correct, say "traditionally attributed to" or "commonly associated with" rather than stating it as fact.
- Never invent concepts, thinkers, or texts. If fewer than 4 strong matches exist, return fewer rather than padding with weak or uncertain ones.

For each concept, provide:
- name: the concept name in English
- original_term: the term in its original language/script if non-English (e.g. 無為, Ubuntu, Ahimsa), or null if English
- tradition: the philosophical/intellectual tradition (e.g. "Stoic (Greek)", "Daoist (Chinese)", "Yoruba (West African)", "Advaita Vedanta (Indian)")
- explanation: 2-3 sentences explaining the concept in plain language and why it matches the user's idea. Be specific about the connection.
- thinkers: key thinkers associated with this concept (e.g. "Zhuangzi, Laozi" or "Marcus Aurelius, Epictetus")
- source_text: the specific primary text where this concept is articulated (e.g. "Dao De Jing, Ch. 37", "Meditations, Book V", "Bhagavad Gita, Ch. 3")
- learn_more_url: a URL to the Stanford Encyclopedia of Philosophy (plato.stanford.edu) article for this concept if one exists, otherwise a Wikipedia URL. Must be a real, existing page — do not guess URLs.
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
      "source_text": "...",
      "learn_more_url": "...",
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

  if (MOCK_MODE) {
    // Simulate a short delay like a real API call
    await new Promise(r => setTimeout(r, 1200));
    return res.json({
      concepts: [
        {
          name: "Wu Wei",
          original_term: "無為",
          tradition: "Daoist (Chinese)",
          explanation: "Wu Wei means 'non-action' or 'effortless action' — not laziness, but acting in harmony with the natural flow of things. Your idea about accepting what you can't control resonates with the Daoist insight that forcing outcomes often backfires.",
          thinkers: "Laozi, Zhuangzi",
          source_text: "Dao De Jing, Ch. 37 (Laozi); Zhuangzi, Inner Chapters",
          learn_more_url: "https://plato.stanford.edu/entries/daoism/",
          closeness: 0.92,
          is_closest: true
        },
        {
          name: "Nishkama Karma",
          original_term: "निष्काम कर्म",
          tradition: "Vedanta (Indian)",
          explanation: "Action without attachment to results — a central teaching of the Bhagavad Gita. You act fully and skillfully, but release your grip on outcomes. This directly mirrors your idea: do what you can, accept what you can't control.",
          thinkers: "Vyasa (traditionally attributed), Adi Shankara",
          source_text: "Bhagavad Gita, Ch. 3 (Karma Yoga)",
          learn_more_url: "https://plato.stanford.edu/entries/hindu-philosophy/",
          closeness: 0.90,
          is_closest: false
        },
        {
          name: "Amor Fati",
          original_term: null,
          tradition: "Stoic (Greek/Roman)",
          explanation: "Literally 'love of fate' — the practice of embracing everything that happens, including suffering, as necessary and even good. This matches your idea of accepting what's beyond your control, but goes further: not just acceptance, but wholehearted embrace.",
          thinkers: "Marcus Aurelius, Epictetus; later adopted by Friedrich Nietzsche",
          source_text: "Meditations, Book V (Marcus Aurelius); Discourses, Book I (Epictetus)",
          learn_more_url: "https://plato.stanford.edu/entries/stoicism/",
          closeness: 0.88,
          is_closest: false
        },
        {
          name: "Rida",
          original_term: "رضا",
          tradition: "Sufi / Islamic",
          explanation: "Rida is contentment with God's decree — a spiritual state of deep acceptance that what happens is part of a larger wisdom. It shares your idea's core insight that peace comes from releasing the need to control outcomes.",
          thinkers: "Rabi'a al-Adawiyya, Al-Ghazali",
          source_text: "Ihya Ulum al-Din (Revival of Religious Sciences), Book 36 (Al-Ghazali)",
          learn_more_url: "https://plato.stanford.edu/entries/al-ghazali/",
          closeness: 0.82,
          is_closest: false
        },
        {
          name: "Ubuntu",
          original_term: null,
          tradition: "Nguni Bantu (Southern African)",
          explanation: "Ubuntu — 'I am because we are' — teaches that individual freedom and fulfillment come through connection to community, not through isolated control. While your idea focuses on personal acceptance, Ubuntu suggests that letting go of individual control opens space for collective wisdom.",
          thinkers: "Desmond Tutu, Augustine Shutte",
          source_text: "No God but God (Tutu, 1999); Ubuntu: An Ethic for a New South Africa (Shutte, 2001)",
          learn_more_url: "https://en.wikipedia.org/wiki/Ubuntu_philosophy",
          closeness: 0.65,
          is_closest: false
        }
      ]
    });
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

# IdeaRoots

Write what's on your mind. Find the thinkers who got there before you.

IdeaRoots connects your everyday ideas to philosophers and social scientists from across history and cultures — Chinese, Indian, Islamic, Greek, African, Nordic, and many more. No jargon. No "Western vs Eastern." Just real people, real texts, real traditions.

## How it works

1. You type an idea or thought
2. IdeaRoots finds the closest match from history
3. You see who thought this before you, where they were, and what they wrote
4. Links take you to the original text in its original language

## Example

> **Your idea:** "The more I learn, the less I know"
>
> *You share this thought with Zhuangzi, who told stories about butterflies and fish in China 2,300 years ago.*
>
> **The Limits of Knowledge** (無知) — Daoist (Chinese)
>
> From the *Zhuangzi*, Ch. 2 (Qi Wu Lun)
> [Read the original text](https://ctext.org/zhuangzi/qi-wu-lun)

## Run it locally

```bash
# Clone and install
git clone https://github.com/oliviayliu/idearoots.git
cd idearoots
npm install

# Add your free Groq API key (get one at console.groq.com)
echo "GROQ_API_KEY=gsk_your-key-here" > .env

# Start
npm start
# Open http://localhost:3000
```

## Stack

- **Frontend**: HTML + CSS + vanilla JS (no framework)
- **Backend**: Node.js + Express
- **LLM**: Llama 3.3 70B via [Groq](https://groq.com) (free tier)
- **Sources**: [ctext.org](https://ctext.org) (Chinese), [Perseus](https://www.perseus.tufts.edu) (Greek/Latin), [WisdomLib](https://www.wisdomlib.org) (Indian), [Sacred Texts](https://www.sacred-texts.com), Wikipedia

## Traditions covered

40+ specific traditions including Daoist, Confucian, Buddhist (Chinese/Indian/Japanese/Tibetan), Vedanta, Yoga, Sufi, Stoic, Platonic, Aristotelian, Epicurean, Roman, Norse, Celtic, Yoruba, Bantu, Existentialist, Pragmatist, and many more. No vague "Western" or "Eastern" labels.

## License

MIT

# IdeaRoots

You (I) come up with 10,000 ideas a day. By minute two, they're gone.

But maybe in fact they areconnected to real, grounded thinking across cultures and centuries? 

Thinkers in the history explored the same terrain, wrote it down, argued about it, built entire schools of thought around it. Philosophy and social science sit behind jargon and academic gatekeeping. 

IdeaRoots build the across. Write what's on your mind. The app finds the philosopher or social scientist from history who got there before you, from Confucian to Sufi, Stoic to Yoruba, Buddhist to Norse. One best match up front. More voices if you want them. Each result links to the original text in its original language. Save your favourites. Share them with friends.

## How it works

1. Write your idea or thought
2. IdeaRoots finds the closest match from history
3. You see who thought this before you, where they were, and what they wrote
4. Save it or copy it to share

## Example

> **Your idea:** "The more I learn, the less I know"
>
> *You share this thought with Zhuangzi, who told stories about butterflies and fish in China 2,300 years ago.*
>
> **The Limits of Knowledge** (無知) — Daoist (Chinese)
>
> From the *Zhuangzi*, Ch. 2 (Qi Wu Lun)
> [Read the original text](https://ctext.org/zhuangzi/qi-wu-lun)

## Try it

**[idearoots.vercel.app](https://idearoots.vercel.app)**

## Run it locally

```bash
git clone https://github.com/oliviayliu/idearoots.git
cd idearoots
npm install

# Add your free Groq API key (get one at console.groq.com)
echo "GROQ_API_KEY=gsk_your-key-here" > .env

npm start
# Open http://localhost:3000
```

## Stack

- **Frontend**: HTML + CSS + vanilla JS (no framework)
- **Backend**: Node.js + Express (local), Vercel serverless (production)
- **LLM**: Llama 3.3 70B via [Groq](https://groq.com) (free tier)
- **Sources**: [ctext.org](https://ctext.org) (Chinese), [Perseus](https://www.perseus.tufts.edu) (Greek/Latin), Wikipedia, and others

## Traditions covered

40+ specific traditions including Daoist, Confucian, Buddhist (Chinese, Indian, Japanese, Tibetan), Vedanta, Yoga, Sufi, Stoic, Platonic, Aristotelian, Epicurean, Roman, Norse, Celtic, Yoruba, Bantu, Existentialist, Pragmatist, and more. No vague "Western" or "Eastern" labels.

## License

MIT

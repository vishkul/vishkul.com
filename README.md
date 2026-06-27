# vishkul.com

Personal site and a small suite of marketing tools, by Vishesh Kulshrestha.

Live at **[vishkul.com](https://www.vishkul.com)** · tools at **[vishkul.com/tools](https://www.vishkul.com/tools)**

## What's here

- **Portfolio** (`/`): work in marketing, content, go-to-market, and AI-assisted building.
- **vishkul/tools** (`/tools`): two kinds of tools, all deterministic, free, no signup, nothing stored.
  - **Marketing tools**
    - **AEO Checker** (`/tools/aeo.html`): paste a URL and score how readable it is to AI answer engines (ChatGPT, Perplexity, Claude), with a ranked list of fixes. **Live.**
    - **Brand Voice Extractor** (`/tools/brand-voice.html`): measure a site's voice from its copy (tone, rhythm, perspective, signature words), with do's, don'ts, and a paste-ready prompt for full guidelines. **Live.**
    - **Cold Email Teardown** (`/tools/cold-email.html`): paste a cold email, get a reply-readiness score, the specific reply-rate killers, and a rewrite prompt. Runs client-side. **Live.**
  - **Experiments**
    - **Brand from a Word** (`/tools/brand-from-word.html`): type one word and a procedural engine generates a full mini brand (color palette, font pairing, logo mark, voice direction) with the reasoning for each. Deterministic, runs client-side. **Live.**
    - **Browser X-ray** (`/tools/browser-x-ray.html`): a privacy mirror showing everything the visitor's browser exposes, plus a derived fingerprint. Runs client-side, nothing leaves the page. **Live.**
    - **Reverse-Prompt** (`/tools/reverse-prompt.html`): paste AI text and it reconstructs the likely prompt behind it (task, tone, format, persona), plus the AI tells it spotted. Runs client-side. **Live.**

## How it works

Static site, no build step, no dependencies. The AEO Checker and Brand Voice Extractor each use a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/) (`functions/api/`) to fetch a page server-side, where the browser's CORS rules can't block them, then run a deterministic analysis. The Cold Email Teardown and Brand from a Word run fully client-side, so they work the instant the page loads. Every check is a concrete, verifiable signal, with no external AI call, no API key, and no per-scan cost anywhere in the suite.

## Run locally

The pages are static and open in any browser, but the AEO scan needs the function to run. To test it locally (needs [Node](https://nodejs.org)):

```bash
npx wrangler pages dev .
```

Then open the localhost URL it prints.

## Deploy

Connected to Cloudflare Pages. Pushing to the default branch deploys automatically. Build command: none. Output directory: `/` (root).

## Structure

```
.
├── index.html              portfolio
├── assets/                 portfolio images
├── tools/
│   ├── index.html          tools suite landing
│   ├── aeo.html            AEO Checker
│   ├── brand-voice.html    Brand Voice Extractor
│   ├── cold-email.html       Cold Email Teardown (client-side)
│   ├── brand-from-word.html  Brand from a Word generator (client-side)
│   ├── browser-x-ray.html    Browser X-ray privacy mirror (client-side)
│   ├── reverse-prompt.html   Reverse-Prompt prompt reconstructor (client-side)
│   └── assets/tools.css      shared tool styling
└── functions/
    └── api/
        ├── analyze.js      AEO scanner (server-side)
        └── voice.js        voice analyzer (server-side)
```

## Contact

Vishesh Kulshrestha · Bengaluru · vishkul2905@gmail.com

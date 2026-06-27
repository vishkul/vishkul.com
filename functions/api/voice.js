// Brand Voice Extractor. Cloudflare Pages Function.
// Route: /api/voice?url=<page-url>
// Fetches a page server-side, measures real linguistic features of its copy,
// and returns a voice profile. No API key, no external AI call.

const STOPWORDS = new Set("a an and the of to in on for with at by from is are was were be been being it its this that these those as or but if then so than too very can will just have has had do does did not no nor your you you're we we're our us i i'm my me they them their he she his her there here what which who when where how all any both each few more most other some such only own same s t re ve ll d m up out about into over after under again further once".split(/\s+/));

const BUZZWORDS = ["leverage","synergy","seamless","seamlessly","robust","cutting-edge","cutting edge","empower","empowering","unlock","revolutionize","revolutionary","best-in-class","game-changing","game changer","innovative","innovation","solution","solutions","holistic","scalable","frictionless","disrupt","disruptive","paradigm","next-generation","next generation","world-class","turnkey","bleeding-edge","mission-critical","value-add","streamline","streamlined","optimize","ecosystem","bandwidth","actionable","pivot","ideate"];

const ACTION_VERBS = new Set("get build start discover create explore join try learn see find make unlock grow boost launch transform book claim download sign start take meet build run scale ship turn save bring power drive shop browse read watch read subscribe register request schedule".split(/\s+/));

const FORMAL_CONNECTORS = ["however","therefore","moreover","furthermore","consequently","nevertheless","thus","hence","accordingly","notwithstanding"];
const CASUAL_CONNECTORS = ["so","but","plus","and","also","anyway","actually","basically","really","honestly"];

function extractText(html) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  // turn block ends into sentence breaks so headings don't fuse with body
  h = h.replace(/<\/(p|h1|h2|h3|h4|li|div|section|article|blockquote|button|a)>/gi, ". ");
  const text = h
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      const words = s.replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
      return words.length >= 3; // drop fragments / menu crumbs
    });
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export function analyzeVoice({ text = "", finalUrl = "" }) {
  const sentences = splitSentences(text);
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, " ").split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  if (wordCount < 100 || sentenceCount < 6) {
    return {
      url: finalUrl,
      ok: false,
      reason: "not_enough_text",
      sample: { words: wordCount, sentences: sentenceCount },
      message: "There isn't enough readable text on this page to profile a voice (about " + wordCount + " words found). Try a content-rich page like an About, homepage, or blog post. If the site renders text with JavaScript, most of its copy won't be in the raw HTML."
    };
  }

  // ---- sentence rhythm ----
  const sentLens = sentences.map((s) => s.replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean).length);
  const avgLen = sentLens.reduce((a, b) => a + b, 0) / sentLens.length;
  const shortP = Math.round((sentLens.filter((l) => l < 10).length / sentLens.length) * 100);
  const longP = Math.round((sentLens.filter((l) => l > 20).length / sentLens.length) * 100);
  const medP = Math.max(0, 100 - shortP - longP);
  let rhythmVal;
  if (avgLen < 11) rhythmVal = "Short and punchy";
  else if (avgLen <= 17) rhythmVal = "Balanced";
  else rhythmVal = "Long and flowing";

  // ---- formality ----
  const contractions = (text.match(/\b\w+'(t|s|re|ve|ll|d|m)\b/gi) || []).length;
  const contractionRate = contractions / sentenceCount;
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);
  const avgSyll = syllables / wordCount;
  const formalHits = FORMAL_CONNECTORS.reduce((a, c) => a + (text.toLowerCase().split(new RegExp("\\b" + c + "\\b")).length - 1), 0);
  const casualHits = CASUAL_CONNECTORS.reduce((a, c) => a + (text.toLowerCase().split(new RegExp("\\b" + c + "\\b")).length - 1), 0);
  let formalityScore = 0; // higher = more formal
  formalityScore += contractionRate > 0.3 ? -2 : contractionRate > 0.1 ? -1 : 1;
  formalityScore += avgSyll > 1.7 ? 2 : avgSyll > 1.5 ? 1 : avgSyll < 1.4 ? -1 : 0;
  formalityScore += formalHits > casualHits ? 1 : casualHits > formalHits ? -1 : 0;
  let formalityVal;
  if (formalityScore <= -2) formalityVal = "Very casual";
  else if (formalityScore < 0) formalityVal = "Casual";
  else if (formalityScore === 0) formalityVal = "Neutral";
  else if (formalityScore <= 2) formalityVal = "Polished";
  else formalityVal = "Formal";

  // ---- perspective ----
  const count = (re) => (text.toLowerCase().match(re) || []).length;
  const you = count(/\b(you|your|yours|you're)\b/g);
  const weC = count(/\b(we|our|ours|us|we're)\b/g);
  const iC = count(/\b(i|i'm|my|me|mine)\b/g);
  let perspVal, perspDetail;
  if (you >= weC * 1.3 && you >= 6) { perspVal = "Speaks to 'you'"; perspDetail = "Says 'you' " + you + " times vs 'we' " + weC + ". Strongly reader-focused."; }
  else if (weC >= you * 1.3 && weC >= 6) { perspVal = "Speaks as 'we'"; perspDetail = "Says 'we' " + weC + " times vs 'you' " + you + ". Brand-centric."; }
  else if (iC >= you && iC >= weC && iC >= 6) { perspVal = "Personal ('I')"; perspDetail = "Leans on first-person 'I' (" + iC + "). Reads like an individual, not a company."; }
  else { perspVal = "Balanced"; perspDetail = "Mixes 'you' (" + you + ") and 'we' (" + weC + ") fairly evenly."; }

  // ---- energy ----
  const exclaims = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const imperatives = sentences.filter((s) => {
    const first = s.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/)[0];
    return ACTION_VERBS.has(first);
  }).length;
  const exPerSent = exclaims / sentenceCount;
  const cmdPerSent = imperatives / sentenceCount;
  let energyScore = 0;
  energyScore += exPerSent > 0.15 ? 2 : exPerSent > 0.04 ? 1 : 0;
  energyScore += cmdPerSent > 0.12 ? 2 : cmdPerSent > 0.04 ? 1 : 0;
  energyScore += (questions / sentenceCount) > 0.08 ? 1 : 0;
  let energyVal;
  if (energyScore >= 4) energyVal = "High";
  else if (energyScore >= 2) energyVal = "Lively";
  else if (energyScore >= 1) energyVal = "Measured";
  else energyVal = "Calm";

  // ---- reading level (Flesch-Kincaid grade) ----
  const fkGrade = Math.max(1, Math.round(0.39 * (wordCount / sentenceCount) + 11.8 * avgSyll - 15.59));
  let readVal;
  if (fkGrade <= 6) readVal = "Very accessible";
  else if (fkGrade <= 9) readVal = "Easy";
  else if (fkGrade <= 12) readVal = "Moderate";
  else readVal = "Demanding";

  // ---- vocabulary ----
  const freq = {};
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, "");
    if (clean.length < 4 || STOPWORDS.has(clean)) continue;
    freq[clean] = (freq[clean] || 0) + 1;
  }
  const signatureWords = Object.entries(freq)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w, c]) => ({ word: w, count: c }));

  // repeated 2-3 word phrases
  const phraseFreq = {};
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n).map((w) => w.replace(/[^a-z']/g, "")).filter(Boolean);
      if (gram.length < n) continue;
      if (gram.every((g) => STOPWORDS.has(g))) continue;
      if (gram[0].length < 2 || gram[gram.length - 1].length < 2) continue;
      const key = gram.join(" ");
      phraseFreq[key] = (phraseFreq[key] || 0) + 1;
    }
  }
  const phrases = Object.entries(phraseFreq)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([p, c]) => ({ phrase: p, count: c }));

  const buzzFound = [];
  const tl = text.toLowerCase();
  for (const b of BUZZWORDS) {
    const c = tl.split(new RegExp("\\b" + b.replace(/[-]/g, "[- ]") + "\\b")).length - 1;
    if (c > 0) buzzFound.push({ word: b, count: c });
  }
  buzzFound.sort((a, b) => b.count - a.count);
  const buzzTotal = buzzFound.reduce((a, x) => a + x.count, 0);

  // ---- tone descriptors (derived) ----
  const tone = [];
  if (energyVal === "High" || energyVal === "Lively") tone.push(energyVal === "High" ? "Energetic" : "Upbeat");
  else tone.push(formalityVal === "Formal" || formalityVal === "Polished" ? "Composed" : "Easygoing");
  if (formalityVal === "Very casual" || formalityVal === "Casual") tone.push("Conversational");
  else if (formalityVal === "Formal") tone.push("Authoritative");
  else tone.push("Professional");
  if (perspVal === "Speaks to 'you'") tone.push("Direct");
  else if (perspVal === "Personal ('I')") tone.push("Personal");
  else if (rhythmVal === "Short and punchy") tone.push("Crisp");
  else tone.push("Considered");

  // ---- do's and don'ts ----
  const dos = [];
  const donts = [];
  if (perspVal === "Speaks to 'you'") dos.push("Keep addressing the reader as 'you'. Second person is the spine of this voice.");
  if (perspVal === "Speaks as 'we'") dos.push("Lead with 'we' and the brand's point of view, but pull the reader in with 'you' where you can.");
  if (rhythmVal === "Short and punchy") { dos.push("Favor short, punchy sentences. Averaging about " + Math.round(avgLen) + " words keeps the momentum."); donts.push("Don't pad ideas into long, clause-heavy sentences. Brevity is part of the brand."); }
  if (rhythmVal === "Long and flowing") { dos.push("Let sentences breathe and connect ideas; the voice is considered, not clipped."); donts.push("Don't chop everything into fragments. That would read as a different brand."); }
  if (energyVal === "High" || energyVal === "Lively") { dos.push("Open with verbs and calls to action; the energy is part of the identity."); donts.push("Don't go flat or passive. Drained energy reads as off-brand."); }
  if (energyVal === "Calm" || energyVal === "Measured") donts.push("Don't over-hype with exclamation marks; the voice earns trust by staying measured.");
  if (formalityVal === "Very casual" || formalityVal === "Casual") { dos.push("Use contractions and everyday words. Sounding human is the point."); donts.push("Don't slip into corporate stiffness or legalese."); }
  if (formalityVal === "Formal") donts.push("Don't get too colloquial; the voice holds a polished register.");
  if (buzzTotal >= 4) donts.push("Watch the buzzwords. You used " + buzzTotal + " (" + buzzFound.slice(0, 3).map((b) => b.word).join(", ") + "...). They dilute a distinctive voice. Swap for plain, specific language.");
  else dos.push("Stay concrete and specific. The copy mostly avoids empty buzzwords, which is a strength.");
  if (signatureWords.length) dos.push("Reuse your signature words (" + signatureWords.slice(0, 4).map((w) => w.word).join(", ") + ") for consistency.");

  // ---- one-line summary ----
  const persClause = perspVal === "Speaks to 'you'" ? "speaks straight to the reader"
    : perspVal === "Speaks as 'we'" ? "speaks from the brand's point of view"
    : perspVal === "Personal ('I')" ? "sounds like a real person, not a company"
    : "balances brand and reader";
  const rhythmClause = rhythmVal === "Short and punchy" ? "short, punchy" : rhythmVal === "Balanced" ? "balanced" : "longer, flowing";
  const summary = tone.join(", ") + ". It " + persClause + " in " + rhythmClause + " sentences.";

  // ---- paste-ready prompt for full guidelines ----
  const sampleSentences = sentences.slice(0, 8).join(" ");
  const promptText =
`You are a senior brand voice strategist. Using the measured profile and writing sample below, write a complete, practical brand voice and tone guide.

MEASURED PROFILE
- Tone: ${tone.join(", ")}
- Sentence rhythm: ${rhythmVal} (avg ${Math.round(avgLen)} words; ${shortP}% short, ${medP}% medium, ${longP}% long)
- Formality: ${formalityVal}
- Perspective: ${perspVal} (${perspDetail})
- Energy: ${energyVal}
- Reading level: ${readVal} (grade ~${fkGrade})
- Signature words: ${signatureWords.slice(0, 8).map((w) => w.word).join(", ") || "n/a"}
- Repeated phrases: ${phrases.map((p) => '"' + p.phrase + '"').join(", ") || "n/a"}

WRITING SAMPLE
"${sampleSentences}"

Produce: (1) a one-paragraph voice summary, (2) 4-6 voice principles with a short rationale each, (3) a "we sound like / we don't sound like" table, (4) three before/after rewrite examples, and (5) a quick checklist a writer can run before publishing. Keep it specific to this brand, not generic.`;

  return {
    url: finalUrl,
    ok: true,
    sample: { words: wordCount, sentences: sentenceCount },
    summary,
    tone,
    dimensions: [
      { key: "rhythm", label: "Sentence rhythm", value: rhythmVal, detail: "Averages " + Math.round(avgLen) + " words per sentence. " + shortP + "% short, " + medP + "% medium, " + longP + "% long.", bars: { short: shortP, medium: medP, long: longP } },
      { key: "formality", label: "Formality", value: formalityVal, detail: contractionRate > 0.2 ? "Frequent contractions and everyday words." : "Leans on fuller wording and a measured register." },
      { key: "perspective", label: "Perspective", value: perspVal, detail: perspDetail, ratio: { you, we: weC } },
      { key: "energy", label: "Energy", value: energyVal, detail: imperatives + " call-to-action openers, " + exclaims + " exclamation" + (exclaims === 1 ? "" : "s") + ", " + questions + " question" + (questions === 1 ? "" : "s") + "." },
      { key: "reading", label: "Reading level", value: readVal, detail: "Flesch-Kincaid grade about " + fkGrade + "." }
    ],
    vocabulary: { signatureWords, phrases, buzzwords: buzzFound.slice(0, 6), buzzTotal },
    dos,
    donts,
    prompt: promptText
  };
}

// ---- fetching ----
function normalizeUrl(input) {
  let u = (input || "").trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed;
  } catch { return null; }
}

async function fetchText(url, { timeout = 12000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VoiceExtractor/1.0; +https://www.vishkul.com/tools)",
        "Accept": "text/html,application/xhtml+xml,*/*"
      }
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, finalUrl: res.url || url };
  } catch (e) {
    return { ok: false, status: 0, body: "", finalUrl: url, error: String((e && e.message) || e) };
  } finally { clearTimeout(t); }
}

export async function onRequest(context) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });

  const reqUrl = new URL(context.request.url);
  const parsed = normalizeUrl(reqUrl.searchParams.get("url"));
  if (!parsed) return json({ error: "Enter a valid website URL (e.g. example.com)." }, 400);

  const page = await fetchText(parsed.href);
  if (!page.body || page.status === 0) {
    return json({ error: "Couldn't reach that site. It may be blocking automated requests, or the address is wrong.", detail: page.error || ("HTTP " + page.status) }, 502);
  }
  if (page.status >= 400) {
    return json({ error: "The site returned HTTP " + page.status + " for that page. Try the exact URL of a live, public page." }, 502);
  }

  const text = extractText(page.body);
  const report = analyzeVoice({ text, finalUrl: page.finalUrl });
  return json(report);
}

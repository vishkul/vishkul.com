// AEO Checker. Cloudflare Pages Function.
// Route: /api/analyze?url=<page-url>
// Fetches the page (+ robots.txt + llms.txt) server-side (no CORS),
// runs a deterministic "AI readability" analysis, returns JSON.
// No API key, no external AI call. Every check is a concrete, verifiable signal.

const AI_BOTS = [
  "gptbot", "oai-searchbot", "chatgpt-user",
  "claudebot", "anthropic-ai", "claude-web",
  "perplexitybot", "google-extended", "ccbot",
  "bytespider", "amazonbot", "applebot-extended"
];

// Bots that matter most for "will an AI answer engine see you"
const MAJOR_AI_BOTS = ["gptbot", "claudebot", "perplexitybot", "google-extended", "oai-searchbot"];

// ---- robots.txt parsing -----------------------------------------------------
function parseRobotsGroups(robots) {
  const lines = robots.split(/\r?\n/);
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) { lastWasAgent = false; continue; }
    const idx = line.indexOf(":");
    if (idx === -1) { lastWasAgent = false; continue; }
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === "user-agent") {
      if (current && lastWasAgent) {
        current.agents.push(value.toLowerCase());
      } else {
        current = { agents: [value.toLowerCase()], rules: [] };
        groups.push(current);
      }
      lastWasAgent = true;
    } else {
      if (current) current.rules.push({ field, value });
      lastWasAgent = false;
    }
  }
  return groups;
}

function isFullyBlocked(groups, agent) {
  const g = groups.find((gr) => gr.agents.includes(agent));
  if (!g) return false;
  const disallowRoot = g.rules.some((r) => r.field === "disallow" && r.value === "/");
  const allowRoot = g.rules.some((r) => r.field === "allow" && r.value === "/");
  return disallowRoot && !allowRoot;
}

// ---- small HTML helpers (regex-based; we only need specific signals) --------
function countMatches(re, str) {
  const m = str.match(re);
  return m ? m.length : 0;
}

function extractText(bodyHtml) {
  return bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- the analysis -----------------------------------------------------------
// Returns a full scorecard. Pure function, no network, no env. Testable.
export function analyzePage({ html = "", robotsTxt = "", llmsTxt = "", finalUrl = "" }) {
  const checks = []; // each: {cat, label, status, points, max, detail, fix}
  const add = (cat, label, status, points, max, detail, fix) =>
    checks.push({ cat, label, status, points, max, detail, fix: fix || "" });

  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html;
  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
  const body = bodyMatch ? bodyMatch[0] : html;
  const text = extractText(body);
  const wordCount = text ? text.split(/\s+/).length : 0;

  const robotsValid = robotsTxt && !/<html|<!doctype/i.test(robotsTxt.slice(0, 500));
  const llmsValid = llmsTxt && !/<html|<!doctype/i.test(llmsTxt.slice(0, 500)) && llmsTxt.trim().length > 0;

  // ============ CATEGORY 1: AI CRAWLER ACCESS (25) ============
  const CAT1 = "AI Crawler Access";
  let blockedMajor = [];
  let starBlocked = false;
  if (robotsValid) {
    const groups = parseRobotsGroups(robotsTxt);
    starBlocked = isFullyBlocked(groups, "*");
    for (const bot of MAJOR_AI_BOTS) {
      if (isFullyBlocked(groups, bot) || starBlocked) blockedMajor.push(bot);
    }
  }
  blockedMajor = [...new Set(blockedMajor)];

  if (blockedMajor.length === 0) {
    add(CAT1, "AI crawlers can access the page", "pass", 15, 15,
      robotsValid ? "robots.txt does not block major AI crawlers." : "No restrictive robots.txt found, so crawlers are allowed by default.");
  } else if (blockedMajor.length >= MAJOR_AI_BOTS.length || starBlocked) {
    add(CAT1, "AI crawlers can access the page", "fail", 0, 15,
      "robots.txt blocks AI crawlers from the whole site.",
      "Your robots.txt blocks AI crawlers (e.g. GPTBot, ClaudeBot) with Disallow: /. If you want to appear in AI search, remove those blocks or scope them narrowly. Right now AI engines likely can't read you at all.");
  } else {
    add(CAT1, "AI crawlers can access the page", "warn", 7, 15,
      "Some AI crawlers are blocked: " + blockedMajor.join(", ") + ".",
      "robots.txt blocks these AI crawlers: " + blockedMajor.join(", ") + ". Unblock the ones you want indexing you for AI search.");
  }

  if (llmsValid) {
    add(CAT1, "llms.txt present", "pass", 10, 10,
      "Found an llms.txt. You're giving AI tools a guided map of your content.");
  } else {
    add(CAT1, "llms.txt present", "warn", 0, 10,
      "No llms.txt found.",
      "Add an /llms.txt file (the emerging standard, like robots.txt but for LLMs). It's a plain-text map pointing AI tools to your most important pages and a short description of what you do. Easy win that signals you're current.");
  }

  // ============ CATEGORY 2: STRUCTURED DATA (25) ============
  const CAT2 = "Structured Data";
  const ldBlocks = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const ldRaw = ldBlocks.join(" ").toLowerCase();

  if (ldBlocks.length > 0) {
    add(CAT2, "Schema.org structured data (JSON-LD)", "pass", 10, 10,
      ldBlocks.length + " JSON-LD block(s) found. Machine-readable facts about your page.");
  } else {
    add(CAT2, "Schema.org structured data (JSON-LD)", "fail", 0, 10,
      "No JSON-LD structured data found.",
      "Add Schema.org JSON-LD markup. This is the single highest-impact AEO fix: it hands AI engines clean, structured facts (who you are, what you sell, your name/logo/links) instead of making them guess from prose. Start with an Organization or WebSite schema.");
  }

  const schemaTypes = ["organization", "website", "webpage", "product", "article", "softwareapplication", "localbusiness", "service", "breadcrumblist", "person"];
  const foundTypes = schemaTypes.filter((t) => ldRaw.includes('"' + t + '"') || ldRaw.includes("'" + t + "'"));
  if (foundTypes.length >= 1) {
    add(CAT2, "Recognized schema types", "pass", 8, 8,
      "Found: " + foundTypes.slice(0, 4).join(", ") + ".");
  } else if (ldBlocks.length > 0) {
    add(CAT2, "Recognized schema types", "warn", 4, 8,
      "JSON-LD exists but no standard high-value type detected.",
      "Your structured data doesn't declare a recognized @type like Organization, Product, or WebSite. Add the type that matches your page so AI knows what kind of thing it's looking at.");
  } else {
    add(CAT2, "Recognized schema types", "fail", 0, 8,
      "No recognized schema types (no JSON-LD).",
      "Once you add JSON-LD, declare a clear @type (Organization for a company site, Product for a product, etc.).");
  }

  const hasFaqSchema = /"faqpage"|"question"|"acceptedanswer"/.test(ldRaw);
  if (hasFaqSchema) {
    add(CAT2, "FAQ structured data", "pass", 7, 7,
      "FAQ schema found. AI answer engines pull Q&A from it directly.");
  } else {
    add(CAT2, "FAQ structured data", "warn", 0, 7,
      "No FAQ schema found.",
      "Add FAQPage schema with a few real questions your customers ask. AI answer engines (ChatGPT, Perplexity) preferentially surface FAQ content because it maps cleanly to how people ask questions. This is one of the most effective ways to get quoted.");
  }

  // ============ CATEGORY 3: CONTENT CLARITY (25) ============
  const CAT3 = "Content Clarity";
  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
  if (title && title.length >= 10 && title.length <= 70) {
    add(CAT3, "Page title", "pass", 5, 5, '"' + title + '"');
  } else if (title) {
    add(CAT3, "Page title", "warn", 3, 5,
      'Title present but ' + (title.length < 10 ? "very short" : "long") + ' (' + title.length + " chars).",
      "Tighten your <title> to a clear 10-70 characters that names what the page is. It's the first thing every engine reads.");
  } else {
    add(CAT3, "Page title", "fail", 0, 5,
      "No <title> tag.",
      "Add a <title> tag. It's the headline AI and search engines use to identify your page.");
  }

  const descMatch = head.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || head.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : "";
  if (desc && desc.length >= 50 && desc.length <= 165) {
    add(CAT3, "Meta description", "pass", 5, 5, '"' + desc.slice(0, 80) + (desc.length > 80 ? "…" : "") + '"');
  } else if (desc) {
    add(CAT3, "Meta description", "warn", 3, 5,
      "Present but " + (desc.length < 50 ? "thin" : "long") + " (" + desc.length + " chars).",
      "Write a 50-165 character meta description that summarizes the page in plain language. AI uses it as a ready-made summary of what you offer.");
  } else {
    add(CAT3, "Meta description", "fail", 0, 5,
      "No meta description.",
      "Add a meta description: a one-sentence plain-language summary of the page. It's a free, AI-readable summary of your value.");
  }

  const h1Count = countMatches(/<h1[\s>]/gi, body);
  if (h1Count === 1) {
    add(CAT3, "Single clear H1", "pass", 5, 5, "Exactly one H1. Clean primary heading.");
  } else if (h1Count === 0) {
    add(CAT3, "Single clear H1", "fail", 0, 5,
      "No H1 heading found.",
      "Add one H1 that states the page's main point. It's the strongest in-content signal of what the page is about.");
  } else {
    add(CAT3, "Single clear H1", "warn", 2, 5,
      h1Count + " H1 tags, so the primary topic is ambiguous.",
      "You have " + h1Count + " H1s. Use exactly one H1 as the page's main heading, and H2/H3 for everything below it, so AI can tell what's primary.");
  }

  const h2Count = countMatches(/<h2[\s>]/gi, body);
  if (h2Count >= 2) {
    add(CAT3, "Heading structure", "pass", 5, 5, h2Count + " H2 sections. Scannable structure.");
  } else if (h2Count === 1) {
    add(CAT3, "Heading structure", "warn", 3, 5,
      "Only one H2.",
      "Break content into a few H2 sections. AI extracts and quotes well-structured sections far more reliably than a wall of text.");
  } else {
    add(CAT3, "Heading structure", "warn", 0, 5,
      "No H2 subheadings.",
      "Add H2 subheadings to break up the page. Clear section headings help AI locate and lift the right answer.");
  }

  if (wordCount >= 300) {
    add(CAT3, "Readable text content", "pass", 5, 5, "~" + wordCount + " words of real HTML text.");
  } else if (wordCount >= 100) {
    add(CAT3, "Readable text content", "warn", 3, 5,
      "Only ~" + wordCount + " words in the HTML.",
      "There's thin text in the raw HTML (~" + wordCount + " words). Make sure your key copy is real HTML text, not baked into images or loaded only by JavaScript.");
  } else {
    add(CAT3, "Readable text content", "fail", 0, 5,
      "Very little text in the HTML (~" + wordCount + " words).",
      "Almost no readable text in the initial HTML. If your content is rendered by JavaScript or sits inside images, most AI crawlers can't see it. Ensure core copy is present as server-rendered HTML text.");
  }

  // ============ CATEGORY 4: TECHNICAL SIGNALS (25) ============
  const CAT4 = "Technical Signals";
  const hasOgTitle = /<meta[^>]+property=["']og:title["']/i.test(head);
  const hasOgDesc = /<meta[^>]+property=["']og:description["']/i.test(head);
  if (hasOgTitle && hasOgDesc) {
    add(CAT4, "Open Graph tags", "pass", 7, 7, "og:title and og:description present.");
  } else if (hasOgTitle || hasOgDesc) {
    add(CAT4, "Open Graph tags", "warn", 4, 7,
      "Partial Open Graph tags.",
      "Add the full set of Open Graph tags (og:title, og:description, og:image, og:url). They give AI and social tools a clean, structured summary card of the page.");
  } else {
    add(CAT4, "Open Graph tags", "warn", 0, 7,
      "No Open Graph tags.",
      "Add Open Graph meta tags (og:title, og:description, og:image, og:url). They're widely used as a reliable, structured summary of the page.");
  }

  const semanticTags = ["<main", "<article", "<section", "<header", "<nav", "<footer"];
  const semanticFound = semanticTags.filter((t) => body.toLowerCase().includes(t)).length;
  if (semanticFound >= 3) {
    add(CAT4, "Semantic HTML", "pass", 6, 6, semanticFound + " semantic landmark tags used.");
  } else if (semanticFound >= 1) {
    add(CAT4, "Semantic HTML", "warn", 3, 6,
      "Few semantic landmarks.",
      "Use semantic HTML5 tags (main, article, section, header, nav). They help crawlers understand page regions instead of seeing one undifferentiated <div> soup.");
  } else {
    add(CAT4, "Semantic HTML", "warn", 0, 6,
      "No semantic HTML5 landmarks.",
      "Wrap content in semantic tags (main, article, section, header, nav) instead of plain divs. It gives crawlers structural cues about what each region is.");
  }

  const listCount = countMatches(/<(ul|ol)[\s>]/gi, body);
  const liCount = countMatches(/<li[\s>]/gi, body);
  if (listCount >= 1 && liCount >= 3) {
    add(CAT4, "Lists for scannable facts", "pass", 6, 6, listCount + " list(s), " + liCount + " items.");
  } else {
    add(CAT4, "Lists for scannable facts", "warn", 0, 6,
      "Little or no list content.",
      "Where it fits, present features, steps, or specs as bullet or numbered lists. AI answer engines lift list items cleanly into responses, so list-formatted facts get surfaced more often.");
  }

  const imgCount = countMatches(/<img[\s>]/gi, body);
  const imgWithAlt = countMatches(/<img[^>]+alt=["'][^"']/gi, body);
  if (imgCount === 0) {
    add(CAT4, "Image alt text", "pass", 6, 6, "No images to caption.");
  } else {
    const ratio = imgWithAlt / imgCount;
    if (ratio >= 0.8) {
      add(CAT4, "Image alt text", "pass", 6, 6, imgWithAlt + "/" + imgCount + " images have alt text.");
    } else if (ratio >= 0.4) {
      add(CAT4, "Image alt text", "warn", 3, 6,
        "Only " + imgWithAlt + "/" + imgCount + " images have alt text.",
        "Add descriptive alt text to your images. It's content AI can actually read, and it's the only way visual information reaches text-based crawlers.");
    } else {
      add(CAT4, "Image alt text", "warn", 0, 6,
        "Most images (" + (imgCount - imgWithAlt) + "/" + imgCount + ") lack alt text.",
        "Add descriptive alt text to your images. Right now most carry none, so any information in them is invisible to AI.");
    }
  }

  // ---- tally ----
  const categories = {};
  for (const c of checks) {
    if (!categories[c.cat]) categories[c.cat] = { name: c.cat, points: 0, max: 0, checks: [] };
    categories[c.cat].points += c.points;
    categories[c.cat].max += c.max;
    categories[c.cat].checks.push(c);
  }
  const score = checks.reduce((s, c) => s + c.points, 0);
  const maxScore = checks.reduce((s, c) => s + c.max, 0);

  let grade, verdict;
  if (score >= 85) { grade = "A"; verdict = "AI-ready"; }
  else if (score >= 70) { grade = "B"; verdict = "Mostly visible"; }
  else if (score >= 50) { grade = "C"; verdict = "Visible, with real gaps"; }
  else if (score >= 30) { grade = "D"; verdict = "Hard for AI to read"; }
  else { grade = "F"; verdict = "Largely invisible to AI"; }

  // fixes: every non-full check, biggest impact first
  const fixes = checks
    .filter((c) => c.status !== "pass" && c.fix)
    .map((c) => ({ label: c.label, status: c.status, lost: c.max - c.points, fix: c.fix }))
    .sort((a, b) => b.lost - a.lost);

  return {
    url: finalUrl,
    score,
    maxScore,
    grade,
    verdict,
    categories: Object.values(categories),
    fixes,
    meta: { title, wordCount, hasRobots: !!robotsValid, hasLlms: !!llmsValid }
  };
}

// ---- fetching helpers -------------------------------------------------------
function normalizeUrl(input) {
  let u = (input || "").trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchText(url, { timeout = 12000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AEO-Checker/1.0; +https://tools.vishkul.com)",
        "Accept": "text/html,application/xhtml+xml,text/plain,*/*"
      }
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, finalUrl: res.url || url };
  } catch (e) {
    return { ok: false, status: 0, body: "", finalUrl: url, error: String(e && e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

// ---- the Pages Function handler --------------------------------------------
export async function onRequest(context) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", ...cors }
    });

  const reqUrl = new URL(context.request.url);
  const target = reqUrl.searchParams.get("url");
  const parsed = normalizeUrl(target);
  if (!parsed) {
    return json({ error: "Enter a valid website URL (e.g. example.com)." }, 400);
  }

  const page = await fetchText(parsed.href);
  if (!page.body || page.status === 0) {
    return json({
      error: "Couldn't reach that site. It may be blocking automated requests, or the address is wrong.",
      detail: page.error || ("HTTP " + page.status)
    }, 502);
  }
  if (page.status >= 400) {
    return json({
      error: "The site returned HTTP " + page.status + " for that page. Try the exact URL of a live, public page."
    }, 502);
  }

  const origin = new URL(page.finalUrl).origin;
  const [robots, llms] = await Promise.all([
    fetchText(origin + "/robots.txt", { timeout: 6000 }),
    fetchText(origin + "/llms.txt", { timeout: 6000 })
  ]);

  const report = analyzePage({
    html: page.body,
    robotsTxt: robots.ok ? robots.body : "",
    llmsTxt: llms.ok ? llms.body : "",
    finalUrl: page.finalUrl
  });

  return json(report);
}

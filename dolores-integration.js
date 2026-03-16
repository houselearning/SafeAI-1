// dolores-integration.js
// Drop into any project to use Dolores's knowledge base + image gen
// All files from aidolores.github.io are loaded automatically.

const Dolores = {
  kb: {},           // flat knowledge base (smart.json)
  functions: {},    // code patterns (functions.json)
  templates: {},    // project templates (templates.json)
  ready: false,

  async init() {
    const BASE = 'https://aidolores.github.io';
    const [smart, funcs, tpls] = await Promise.all([
      fetch(BASE + '/smart.json').then(r => r.json()),
      fetch(BASE + '/functions.json').then(r => r.json()),
      fetch(BASE + '/templates.json').then(r => r.json()),
    ]);
    // Flatten smart.json categories into one lookup
    if (smart.knowledge)
      Object.values(smart.knowledge).forEach(cat =>
        Object.assign(this.kb, cat));
    if (smart.debug) Object.assign(this.kb, smart.debug);
    this.functions = funcs;
    this.templates = tpls;
    this.ready = true;
    console.log('[Dolores] Loaded', Object.keys(this.kb).length,
      'KB entries,', Object.keys(this.templates.projects||{}).length,
      'templates');
    return this;
  },

  // Query the knowledge base — returns best match or null
  query(input) {
    const lower = input.toLowerCase();
    const words = lower.split(/\W+/).filter(w => w.length > 2);
    let best = 0, result = null;
    for (const [key, val] of Object.entries(this.kb)) {
      let score = 0;
      if (lower.includes(key)) score += 10;
      key.split(' ').forEach(kw => { if (lower.includes(kw)) score += 3; });
      words.forEach(w => { if (key.includes(w)) score += 2; });
      words.forEach(w => { if (val.toLowerCase().includes(w)) score += 1; });
      if (score > best) { best = score; result = val; }
    }
    return best >= 2 ? result : null;
  },

  // Generate an image URL via Pollinations.ai (free, no key needed)
  imageURL(prompt, w = 512, h = 512) {
    return 'https://image.pollinations.ai/prompt/' +
      encodeURIComponent(prompt) +
      '?width=' + w + '&height=' + h + '&nologo=true';
  },

  // Get a project template by name (from templates.json)
  template(name) {
    return this.templates?.projects?.[name] || null;
  },

  // Full respond: KB first, then optional OpenRouter AI fallback
  async respond(input, openRouterKey = null) {
    const kbAnswer = this.query(input);
    if (kbAnswer) return { source: 'kb', text: kbAnswer };

    if (openRouterKey) {
      try {
        const res = await fetch(
          'https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openRouterKey,
            'HTTP-Referer': 'https://aidolores.github.io',
            'X-Title': 'Dolores',
          },
          body: JSON.stringify({
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: input }],
            max_tokens: 1000,
          }),
        });
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { source: 'ai', text };
      } catch(e) { console.warn('[Dolores] AI failed:', e.message); }
    }
    return { source: 'none', text: null };
  },
};

// Auto-init when script loads
Dolores.init();

// ── Usage examples ─────────────────────────────────────────────
//
// 1. Basic query:
//    await Dolores.init();
//    const answer = Dolores.query("what is javascript");
//    console.log(answer);
//
// 2. Full response with AI fallback:
//    const res = await Dolores.respond("explain recursion", "sk-or-v1-YOUR_KEY");
//    console.log(res.source, res.text);
//
// 3. Generate an image:
//    const url = Dolores.imageURL("purple dragon at sunset");
//    document.querySelector('img').src = url;
//
// 4. Get a project template:
//    const todo = Dolores.template("todo_app");
//    console.log(todo.files); // { "index.html": "...", "app.js": "..." }

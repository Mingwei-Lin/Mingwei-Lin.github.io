// ============================================================
// Terminal engine + GUI renderer
// ============================================================

const output = document.getElementById("term-output");
const input = document.getElementById("term-input");
const termBody = document.getElementById("term-body");

const COMMANDS = {
  help: () => [
    "Available commands:",
    "",
    "  about          who I am",
    "  cv             download my CV (PDF)",
    "  research       papers & talks",
    "  teaching       courses I teach",
    "  blog           notes & posts",
    "  contact        how to reach me",
    "  gui            switch to the normal webpage",
    "  clear          clear the screen",
    "",
    "Tip: use ↑/↓ for history, Tab to complete.",
  ],
  about: () => CONTENT.about.text,
  cv: () => {
    if (PROFILE.cvPdf) window.open(PROFILE.cvPdf, "_blank");
    return CONTENT.cv.text;
  },
  research: () => CONTENT.research.text,
  teaching: () => CONTENT.teaching.text,
  publications: () => CONTENT.research.text,
  pubs: () => CONTENT.research.text,
  blog: () => CONTENT.blog.text,
  contact: () => CONTENT.contact.text,
  clear: () => { output.innerHTML = ""; return null; },
  gui: () => { switchMode("gui"); return null; },
  greet: () => ["Hello! 👋 Nice to see you here.", "Ask me about my research, cv, or notes — or type 'help'."],
  whoami: () => ["visitor"],
  ls: () => ["about  cv  publications  blog  contact"],
  pwd: () => ["/home/mingwei"],
  date: () => [new Date().toString()],
  sudo: () => ["visitor is not in the sudoers file. This incident will be reported."],
  "make me a sandwich": () => ["What? Make it yourself."],
  "sudo make me a sandwich": () => ["Okay. 🥪"],
  exit: () => { switchMode("gui"); return null; },
};

let history = [];
let histIdx = -1;

function print(lines, cls = "") {
  for (const line of lines) {
    const div = document.createElement("div");
    div.className = "term-line " + cls;
    div.textContent = line === "" ? " " : line;
    output.appendChild(div);
  }
  termBody.scrollTop = termBody.scrollHeight;
}

function echoCommand(cmd) {
  const div = document.createElement("div");
  div.className = "term-line";
  div.innerHTML = '<span class="prompt">visitor@mingwei:~$</span> ' +
    cmd.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  output.appendChild(div);
}

// ---------- natural-language intent matching ----------
// Free-form input is mapped onto commands by keyword patterns, then by
// fuzzy match on command names. No API involved — pure client-side.

const INTENTS = [
  { cmd: "greet",    re: /^(hi|hello|hey|yo|good (morning|afternoon|evening)|greetings)\b/ },
  { cmd: "about",    re: /\b(who are you|about (you|yourself|me)|yourself|introduc|bio(graphy)?|background|who is|tell me about)\b/ },
  { cmd: "cv",       re: /\b(cv|resume|r[eé]sum[eé]|curriculum|experience|education|career|where did you study|phd|degree|university)\b/ },
  { cmd: "research", re: /\b(research|papers?|preprints?|publications?|work(ing)? on|study|academic|articles?)\b/ },
  { cmd: "teaching", re: /\b(teach(ing)?|courses?|lectur(e|es|ing)|class(es)?|taught|students?|syllabus)\b/ },
  { cmd: "blog",     re: /\b(blog|notes?|posts?|writing|articles? you wrote)\b/ },
  { cmd: "contact",  re: /\b(contact|email|e-mail|reach|get in touch|talk to you|message you|hire)\b/ },
  { cmd: "gui",      re: /\b(gui|normal|regular|boring|webpage|website view|graphical|no terminal)\b/ },
  { cmd: "help",     re: /\b(help|commands?|what can (i|you) do|options|start|how does this work|lost|stuck)\b/ },
  { cmd: "clear",    re: /\b(clear|clean|wipe|reset)( the)?( screen)?\b/ },
];

function editDistance(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return m[a.length][b.length];
}

function resolve(cmd) {
  if (COMMANDS[cmd]) return { cmd, note: null };
  // intent phrases
  for (const it of INTENTS) if (it.re.test(cmd)) return { cmd: it.cmd, note: cmd };
  // fuzzy typo match on any word, e.g. "reserach", "show me your reserach"
  let best = null, bestD = Infinity;
  for (const word of cmd.split(/\s+/)) {
    if (word.length < 3) continue;
    const maxD = word.length >= 6 ? 2 : 1;
    for (const c of ["about", "research", "teaching", "publications", "cv", "blog", "contact", "help", "gui", "clear"]) {
      const d = editDistance(word, c);
      if (d <= maxD && d < bestD) { bestD = d; best = c; }
    }
  }
  if (best) return { cmd: best, note: cmd };
  return null;
}

const FALLBACKS = [
  "You've reached the limit of my API budget, which is £0.",
  "For intelligent responses, email the human: " + PROFILE.emailUser + " at " + PROFILE.emailDomain + ".",
  "Otherwise, 'help'.",
];

function run(raw) {
  const cmd = raw.trim().toLowerCase();
  echoCommand(raw);
  if (cmd === "") { termBody.scrollTop = termBody.scrollHeight; return; }
  history.push(raw);
  histIdx = history.length;
  input.placeholder = "";
  const hit = resolve(cmd);
  if (hit) {
    if (hit.note && hit.cmd !== "greet") print([`(interpreting as: ${hit.cmd})`], "dim");
    const lines = COMMANDS[hit.cmd]();
    if (lines) print(lines);
  } else {
    print(FALLBACKS, "err");
  }
}

document.getElementById("term-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(input.value);
  input.value = "";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    run(input.value);
    input.value = "";
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
    else { histIdx = history.length; input.value = ""; }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const partial = input.value.trim().toLowerCase();
    if (!partial) return;
    const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(partial));
    if (matches.length === 1) input.value = matches[0];
    else if (matches.length > 1) { echoCommand(input.value); print([matches.join("  ")]); }
  }
});

function focusInput() {
  if (!window.getSelection().toString()) input.focus();
}

// ---------- boot banner ----------
const BANNER = [
  "Last login: " + new Date().toDateString() + " on ttys001",
  "",
  "@@MINGWEI LIN",
  "@@London School of Economics",
  "",
  "Hi, I'm Mingwei — welcome to my site.",
  "Start with 'help', or type 'gui' for a normal webpage.",
  "",
];

function bootType(lines, i = 0) {
  if (i >= lines.length) { input.focus(); return; }
  const line = lines[i];
  if (line.startsWith("@@")) print([line.slice(2)], i === 2 ? "bigname" : "banner");
  else print([line]);
  setTimeout(() => bootType(lines, i + 1), 60);
}

// ---------- GUI rendering ----------
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function renderGUI() {
  // hero
  document.getElementById("hero-name").textContent = PROFILE.name;
  document.getElementById("hero-tagline").textContent =
    PROFILE.title + " · " + PROFILE.affiliation;
  document.getElementById("hero-intro").innerHTML = PROFILE.bio
    .map((p) => `<p>${esc(p)}</p>`).join("");
  document.getElementById("hero-chips").innerHTML = PROFILE.interests
    .map((t) => `<span class="chip">${esc(t)}</span>`).join("");
  const emailText = esc(PROFILE.emailUser) + " at " + esc(PROFILE.emailDomain);
  document.getElementById("hero-links").innerHTML =
    `<a class="hero-link email-link" href="#">✉ ${emailText}</a>` +
    (PROFILE.cvPdf ? `<a class="hero-link" href="${esc(PROFILE.cvPdf)}" target="_blank" rel="noopener">📄 Find my CV here</a>` : "");

  // plain-text summary for search engines and screen readers
  document.getElementById("seo-summary").innerHTML =
    `<p>${esc(PROFILE.name)}, ${esc(PROFILE.title)}, ${esc(PROFILE.affiliation)}.</p>` +
    `<ul>` + RESEARCH.map((p) =>
      `<li>${p.link ? `<a href="${esc(p.link)}">${esc(p.title)}</a>` : esc(p.title)} (${esc(p.authors)})</li>`
    ).join("") + `</ul>`;

  // research
  document.getElementById("gui-pubs").innerHTML = RESEARCH
    .map((p) =>
      `<div class="pub-card">` +
      `<div><div class="pub-title">${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</div>` +
      `<div class="pub-meta">${esc(p.authors)} · <span class="pub-kind">${esc(p.kind)}</span>${p.venue ? " · " + esc(p.venue) : ""}</div>` +
      `</div></div>`
    ).join("");
  document.getElementById("gui-talks").innerHTML = TALKS
    .map((t) => `<div class="talk-row">${esc(t.what)}, <span class="talk-year">${esc(t.year)}</span></div>`)
    .join("");
  document.getElementById("gui-teaching").innerHTML = TEACHING
    .map((g) => `<h3 class="sub-h">${esc(g.kind)}</h3>` +
      g.courses.map((x) => `<div class="talk-row">${esc(x.what)}${x.years ? `, <span class="talk-year">${esc(x.years)}</span>` : ""}</div>`).join(""))
    .join("");


  // posts
  document.getElementById("gui-posts").innerHTML = POSTS.length
    ? POSTS.map((p) =>
        `<div class="pub-card"><div class="pub-year">${esc(p.date)}</div>` +
        `<div><div class="pub-title">${p.link ? `<a href="${esc(p.link)}">${esc(p.title)}</a>` : esc(p.title)}</div>` +
        `<div class="pub-meta">${esc(p.summary)}</div></div></div>`
      ).join("")
    : `<p class="muted">No posts yet — coming soon.</p>`;

  // contact
  document.getElementById("gui-contact").innerHTML =
    `<p>The fastest way to reach me is by email: <a class="email-link" href="#">${emailText}</a>.</p>`;

  // assemble real mailto: only on click (keeps the address out of the HTML)
  for (const a of document.querySelectorAll(".email-link")) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      location.href = "mailto:" + PROFILE.emailUser + "@" + PROFILE.emailDomain;
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("gui-updated").textContent = "Last updated " + LAST_UPDATED;
}

let booted = false;
function switchMode(mode) {
  document.getElementById("terminal-mode").hidden = mode !== "terminal";
  document.getElementById("gui-mode").hidden = mode !== "gui";
  if (mode === "terminal") {
    if (!booted) { booted = true; bootType(BANNER); }
    input.focus();
  }
  try { localStorage.setItem("mode", mode); } catch (e) {}
}

// ---------- init ----------
renderGUI();
let saved = "terminal";
try { saved = localStorage.getItem("mode") || "terminal"; } catch (e) {}
switchMode(saved);

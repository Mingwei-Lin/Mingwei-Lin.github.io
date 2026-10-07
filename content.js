// ============================================================
// SITE CONTENT — single source of truth for terminal & GUI.
// ============================================================

// Set once per content update; shown in the footer as "Last updated ...".
const LAST_UPDATED = "October 2026";

const PROFILE = {
  name: "Mingwei Lin",
  title: "LSE Fellow in Statistics",
  affiliation: "London School of Economics",
  // Email is stored in parts and assembled by JS on click, so the address
  // never appears as plain text or a mailto: in the served files.
  emailUser: "mingwei.lin",
  emailDomain: "outlook.com",
  // TODO: add scholar / linkedin URLs
  bio: [
    "I am an LSE Fellow (postdoctoral position) in the Department of Statistics, working on market microstructure and statistical learning.",
    "I completed my PhD in Statistics at LSE in 2025. Before that, I did an MSc in Mathematics and Finance at Imperial College London.",
  ],
  interests: ["Market microstructure", "Statistical learning", "Bayesian methods", "Quantitative finance"],
  // Put a cv.pdf in the repo root and set this to "cv.pdf" to show the CV link.
  // Leave "" to hide it. (Check the PDF for personal details before publishing.)
  cvPdf: "",
};

const RESEARCH = [
  {
    title: "When large trades are not (automatically) news: liquidity tail risk and price discovery",
    authors: "Çetin, U., Lin, M. and Livieri, G.",
    kind: "preprint",
    venue: "arXiv:2607.01198",
    link: "https://arxiv.org/abs/2607.01198",
  },
  {
    title: "A limit order market with uncertain informed trading participation",
    authors: "Çetin, U. and Lin, M.",
    kind: "preprint",
    venue: "arXiv:2607.04221",
    link: "https://arxiv.org/abs/2607.04221",
  },
  {
    title: "Limit order markets and Bayesian learning",
    authors: "Lin, M.",
    kind: "PhD thesis",
    venue: "London School of Economics",
    link: "https://researchonline.lse.ac.uk/id/eprint/137277/",
  },
  {
    title: "Gradient-free Bayesian mixture-of-experts neural networks",
    authors: "Bernardi, M., Lin, M., Livieri, G. and Maestrini, L.",
    kind: "working paper",
    venue: "",
    link: "",
  },
  {
    title: "Efficient estimation of present-value distributions for long-dated contracts",
    authors: "Kardaras, K. and Lin, M.",
    kind: "working paper",
    venue: "",
    link: "",
  },
];

const TALKS = [
  { year: "2026", what: "13th World Congress of the Bachelier Finance Society, Bologna, Italy (market microstructure mini-symposium)" },
  { year: "2026", what: "Mathematical and Statistical Methods for Actuarial Sciences and Finance (MAF), Barcelona, Spain" },
  { year: "2026", what: "Workshop on Mathematical Finance and Data Science, Siem Reap, Cambodia" },
  { year: "2025", what: "Scuola Normale Superiore Mathematical Finance Workshop, Pisa, Italy" },
  { year: "2025", what: "LSE Research Showcase, London, United Kingdom" },
  { year: "2024", what: "8th London–Paris Bachelier Workshop, Paris, France" },
  { year: "2024", what: "CFE-CMStatistics, London, United Kingdom" },
  { year: "2024", what: "12th World Congress of the Bachelier Finance Society, Rio de Janeiro, Brazil (poster)" },
  { year: "2024", what: "LSE Research Showcase, London, United Kingdom" },
];

const TEACHING = [
  {
    kind: "Lecture",
    courses: [
      { what: "ST211: Applied Regression", years: "2026/2027" },
      { what: "ST207: Databases", years: "2025/2026" },
      { what: "ST202: Probability, Distribution Theory and Inference", years: "2025/2026" },
    ],
  },
  {
    kind: "Seminar",
    courses: [
      { what: "ME317: Statistical Methods for Risk Management, Summer School", years: "2025, 2026" },
      { what: "ME319: Machine Learning and Stochastic Simulation, Summer School", years: "2025, 2026" },
      { what: "ST429: Statistical Methods for Risk Management", years: "2024/2025" },
      { what: "ME116: Introduction to Statistics, Summer School", years: "2022, 2023" },
      { what: "ST102: Elementary Statistical Theory", years: "2021/2022, 2022/2023" },
    ],
  },
];

const POSTS = [
  // { date: "2026-09-01", title: "First post", summary: "…", link: "" },
];

// ---------- terminal renderings (derived from the data above) ----------

const CONTENT = {
  about: {
    title: "About",
    text: [PROFILE.name, PROFILE.title + " · " + PROFILE.affiliation, "", ...PROFILE.bio, "", "Interests: " + PROFILE.interests.join(", ")],
  },
  cv: {
    title: "CV",
    text: PROFILE.cvPdf
      ? ["My CV is available as a PDF: " + PROFILE.cvPdf]
      : ["CV coming soon."],
  },
  research: {
    title: "Research",
    text: [
      ...RESEARCH.flatMap((p, i) => [
        `  [${i + 1}] ${p.title}`,
        `      ${p.authors} · ${p.kind}${p.venue ? " · " + p.venue : ""}`,
        ...(p.link ? [`      ${p.link}`] : []),
        "",
      ]),
      "Talks",
      ...TALKS.map((t) => `  ${t.what}, ${t.year}`),
    ],
  },
  teaching: {
    title: "Teaching",
    text: TEACHING.flatMap((g) => [
      g.kind.toUpperCase(),
      ...g.courses.map((x) => `  ${x.what}${x.years ? ", " + x.years : ""}`),
      "",
    ]),
  },
  blog: {
    title: "Notes",
    text: POSTS.length
      ? POSTS.flatMap((p) => [`  ${p.date}  ${p.title}`, `           ${p.summary}`, ""])
      : ["No posts yet — coming soon."],
  },
  contact: {
    title: "Contact",
    text: [
      "email   " + PROFILE.emailUser + " at " + PROFILE.emailDomain,
    ],
  },
};

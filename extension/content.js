function cleanText(text) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

// Signal retenu après plusieurs échecs sur d'autres approches (id="experience" absent des
// pages, classes CSS générées donc inutilisables, présence d'un type de contrat "· CDI" pas
// systématique — ex. poste de co-fondateur ou "aujourd'hui" sans contrat affiché) : la ligne
// de durée ("· 12 ans", "· 5 mois", "· 3 mois") est présente dans TOUTE ligne d'expérience
// réelle observée, contrat affiché ou non, et absente des liens publicitaires/suggérés
// rencontrés (qui affichent un nombre d'abonnés, jamais une durée). L'entreprise est
// systématiquement la ligne juste avant celle-ci.
const DURATION_PATTERN = /\d+\s*(mois|ans?)\b/i;

function companyFromLink(link) {
  const lines = link.innerText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const durationIndex = lines.findIndex((l) => DURATION_PATTERN.test(l));
  if (durationIndex <= 0) return null;

  const companyLine = lines[durationIndex - 1];
  return companyLine.split("·")[0].trim() || null;
}

function findFirstCompanyLink() {
  const links = Array.from(document.querySelectorAll('a[href*="/company/"], a[href*="/school/"]'));

  for (const link of links) {
    const match = link.href.match(/linkedin\.com\/(company|school)\/([^/?]+)/);
    if (!match) continue;

    const name = companyFromLink(link);
    if (!name) continue; // pas de ligne de durée = probablement pas une vraie expérience

    return {
      url: `https://www.linkedin.com/${match[1]}/${match[2]}/`,
      name,
    };
  }

  return null;
}

function extractText() {
  const url = location.href;
  // LinkedIn utilise le même gabarit de page ("organisation") pour une entreprise et une école
  // (/school/) : même structure DOM, même logique d'extraction/classification côté Nexio.
  const isCompany = url.includes("/company/") || url.includes("/school/");

  if (isCompany) {
    const topCard = document.querySelector(".org-top-card");
    const aboutOverview = document.querySelector(".org-grid__content-height-enforcer");

    const parts = [topCard?.innerText, aboutOverview?.innerText].filter(Boolean);
    const combined = parts.length
      ? parts.join("\n\n")
      : (document.querySelector("main section") || document.querySelector("main"))?.innerText;

    return { url, rawText: cleanText(combined), isCompany };
  }

  const container =
    document.querySelector(".pv-top-card") ||
    document.querySelector("main section") ||
    document.querySelector("main");

  return {
    url,
    rawText: cleanText(container?.innerText),
    isCompany,
    firstCompany: findFirstCompanyLink(),
  };
}

function diagnoseCompanyLinks() {
  const allLinks = Array.from(document.querySelectorAll('a[href*="/company/"], a[href*="/school/"]'));

  const lines = allLinks.map((link, i) => {
    const rawLines = link.innerText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const name = companyFromLink(link);
    const tag = name ? `[RETENU : "${name}"] ` : "";
    const preview = rawLines.join(" ⏎ ").slice(0, 80);
    return `${i}. ${tag}${link.href} — ${preview}`;
  });

  return [`Nombre de liens /company/ ou /school/ sur toute la page : ${allLinks.length}`, "", ...lines].join(
    "\n"
  );
}

function diagnose() {
  const main = document.querySelector("main");
  if (!main) return { url: location.href, dump: "Aucun <main> trouvé sur cette page." };

  const seen = new Set();
  const candidates = [];

  main.querySelectorAll(":scope > *, :scope > * > *, :scope > * > * > *").forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);

    const text = (el.innerText || "").trim();
    if (!text || text.length < 20) return;

    candidates.push({
      tag: el.tagName.toLowerCase(),
      class: (el.getAttribute("class") || "").slice(0, 90),
      length: text.length,
      preview: text.slice(0, 90).replace(/\n/g, " ⏎ "),
    });
  });

  candidates.sort((a, b) => a.length - b.length);

  const dump = candidates
    .map((c, i) => `${i}. <${c.tag} class="${c.class}"> (${c.length} car.) — ${c.preview}`)
    .join("\n");

  return { url: location.href, dump: `${diagnoseCompanyLinks()}\n\n=== Blocs de la page ===\n${dump}` };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasExperienceLinkRendered() {
  return Array.from(document.querySelectorAll('a[href*="/company/"], a[href*="/school/"]')).some(
    (link) => companyFromLink(link) !== null
  );
}

// LinkedIn ne rend la section Expériences dans le DOM qu'une fois qu'elle a été scrollée à
// l'écran (chargement différé). `window.scrollBy` s'est révélé sans effet (LinkedIn scrolle
// vraisemblablement un conteneur interne, pas la fenêtre globale) : on combine plusieurs
// techniques de scroll pour maximiser les chances de déclencher le rendu, quel que soit le
// mécanisme exact utilisé par LinkedIn, et on attend plus longtemps (jusqu'à ~5s) avant
// d'abandonner.
async function ensureExperienceRendered() {
  if (hasExperienceLinkRendered()) return;

  const footer = document.querySelector("footer");
  footer?.scrollIntoView({ block: "end", behavior: "smooth" });
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  document.scrollingElement?.scrollTo?.({ top: document.scrollingElement.scrollHeight, behavior: "smooth" });

  for (let i = 0; i < 12; i++) {
    await wait(400);
    if (hasExperienceLinkRendered()) return;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "NEXIO_EXTRACT") {
    const isCompany = location.href.includes("/company/") || location.href.includes("/school/");
    if (isCompany) {
      sendResponse(extractText());
    } else {
      ensureExperienceRendered().then(() => sendResponse(extractText()));
    }
    return true;
  }
  if (message?.type === "NEXIO_DIAGNOSE") {
    const isCompany = location.href.includes("/company/") || location.href.includes("/school/");
    if (isCompany) {
      sendResponse(diagnose());
    } else {
      ensureExperienceRendered().then(() => sendResponse(diagnose()));
    }
    return true;
  }
  return true;
});

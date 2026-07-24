function cleanText(text) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function slugToName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Trouve l'élément portant le titre visible "Expérience" (pas d'id ni de classe stable sur
// cette section, vérifié absent sur plusieurs profils) en cherchant le texte lui-même via
// TreeWalker, plutôt que de deviner un sélecteur structurel.
function findExperienceHeading() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim() === "Expérience") return node.parentElement;
  }
  return null;
}

// Nom lisible depuis un lien d'expérience : la ligne juste avant la durée ("· 12 ans",
// "· 5 mois") si elle existe (le plus propre), sinon null (le slug de l'URL prend le relais).
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

// Le premier lien entreprise/école qui apparaît après le titre "Expérience" dans l'ordre du
// DOM : c'est ce que Gilles veut, rien de plus compliqué. Pas de repli sur toute la page si le
// titre n'est pas trouvé (a déjà remonté des liens sponsorisés/suggérés par le passé).
function findFirstCompanyLink() {
  const heading = findExperienceHeading();
  if (!heading) return null;

  const links = Array.from(document.querySelectorAll('a[href*="/company/"], a[href*="/school/"]')).filter(
    (link) => heading.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING
  );

  for (const link of links) {
    const match = link.href.match(/linkedin\.com\/(company|school)\/([^/?]+)/);
    if (!match) continue;

    const name = companyFromLink(link) || slugToName(match[2]);
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
    experienceHeadingFound: Boolean(findExperienceHeading()),
  };
}

function diagnoseCompanyLinks() {
  const heading = findExperienceHeading();
  const allLinks = Array.from(document.querySelectorAll('a[href*="/company/"], a[href*="/school/"]'));

  const lines = allLinks.map((link, i) => {
    const rawLines = link.innerText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const isAfterHeading = heading
      ? Boolean(heading.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING)
      : false;
    const name = companyFromLink(link);
    const tag = isAfterHeading ? `[APRÈS "Expérience"${name ? ` : "${name}"` : ""}] ` : "";
    const preview = rawLines.join(" ⏎ ").slice(0, 80);
    return `${i}. ${tag}${link.href} — ${preview}`;
  });

  return [
    `Titre "Expérience" trouvé sur la page : ${heading ? "oui" : "non"}`,
    `Nombre de liens /company/ ou /school/ sur toute la page : ${allLinks.length}`,
    "",
    ...lines,
  ].join("\n");
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

// LinkedIn ne rend la section Expériences dans le DOM qu'une fois qu'elle a été scrollée à
// l'écran (chargement différé). Confirmé par test réel : un scroll déclenché en JS
// (`scrollIntoView`/`scrollTo`) n'a AUCUN effet sur ce chargement, seul un vrai scroll humain
// le déclenche (Gilles l'a vérifié : après un scroll manuel jusqu'à la section, un second clic
// sur l'extension a fonctionné). Inutile de simuler un scroll qui ne marche pas — on se contente
// de vérifier l'état, et le popup guide Gilles vers un scroll manuel si besoin.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "NEXIO_EXTRACT") {
    sendResponse(extractText());
    return true;
  }
  if (message?.type === "NEXIO_DIAGNOSE") {
    sendResponse(diagnose());
    return true;
  }
  return true;
});

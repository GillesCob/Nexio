const DEFAULT_API_URL = "https://nexio-api.gillescobigo.com";

const extractButton = document.getElementById("extract-btn");
const diagnoseButton = document.getElementById("diagnose-btn");
const status = document.getElementById("status");
const nextStep = document.getElementById("next-step");

async function getConfig() {
  const { apiUrl, token } = await chrome.storage.local.get(["apiUrl", "token"]);
  return { apiUrl: apiUrl || DEFAULT_API_URL, token };
}

async function getActiveLinkedInTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !tab.url.includes("linkedin.com")) return null;
  return tab;
}

function sendToContentScript(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(response);
    });
  });
}

async function apiPost(apiUrl, token, path, body) {
  const res = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`);
  }

  return data;
}

function showRawTextFallback(rawText, url) {
  nextStep.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = "Copier le texte brut (échec de l'envoi)";
  btn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(`${rawText}\n\nLien LinkedIn : ${url}`);
    status.textContent = "Copié dans le presse-papiers.";
  });
  nextStep.appendChild(btn);
}

function truncate(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function showOpenCompanyButton(company) {
  nextStep.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = `Ouvrir ${truncate(company.name, 30)} →`;
  btn.title = company.name;
  btn.addEventListener("click", () => {
    chrome.tabs.create({ url: company.url });
  });
  nextStep.appendChild(btn);
}

// Repli manuel : si la détection automatique du lien entreprise échoue (profil atypique,
// LinkedIn change encore sa structure), Gilles peut coller l'URL lui-même (clic droit sur le
// lien de l'entreprise sur LinkedIn > copier l'adresse du lien) sans quitter le popup.
function showManualCompanyInput(contactId) {
  nextStep.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Colle l'URL LinkedIn de son entreprise…";
  input.style.width = "100%";
  input.style.boxSizing = "border-box";
  input.style.padding = "6px";
  input.style.fontSize = "13px";
  input.style.marginBottom = "6px";

  const btn = document.createElement("button");
  btn.textContent = "Ouvrir cette entreprise →";

  btn.addEventListener("click", async () => {
    const url = input.value.trim();
    if (!url.includes("linkedin.com/company/") && !url.includes("linkedin.com/school/")) {
      status.textContent = "URL invalide (doit contenir linkedin.com/company/ ou /school/).";
      return;
    }

    await chrome.storage.session.set({
      pendingContactId: contactId,
      pendingCompany: { url, name: "l'entreprise" },
    });
    chrome.tabs.create({ url });
  });

  nextStep.appendChild(input);
  nextStep.appendChild(btn);
}

extractButton.addEventListener("click", async () => {
  if (extractButton.disabled) return; // évite un deuxième clic pendant le traitement en cours

  nextStep.innerHTML = "";
  status.textContent = "Chargement…";
  extractButton.disabled = true;
  extractButton.textContent = "Chargement…";

  try {
    const { apiUrl, token } = await getConfig();
    if (!token) {
      status.textContent = "Configure d'abord le token dans les réglages de l'extension (clic droit sur l'icône > Options).";
      return;
    }

    const tab = await getActiveLinkedInTab();
    if (!tab) {
      status.textContent = "Ouvre un profil ou une page entreprise LinkedIn d'abord.";
      return;
    }

    const page = await sendToContentScript(tab.id, { type: "NEXIO_EXTRACT" });
    if (!page?.rawText) {
      status.textContent = "Extraction impossible sur cette page (recharge et réessaie).";
      return;
    }

    const rawTextWithUrl = `${page.rawText}\n\nLien LinkedIn : ${page.url}`;
    status.textContent = "Envoi à Nexio...";

    await handleExtractedPage(apiUrl, token, page, rawTextWithUrl, tab.id);
  } finally {
    extractButton.disabled = false;
    extractButton.textContent = "Extraire et envoyer à Nexio";
  }
});

function closeTabSoon(tabId) {
  setTimeout(() => chrome.tabs.remove(tabId), 1200);
}

// Recharge le(s) onglet(s) Nexio déjà ouverts après une mutation réussie, pour que les
// pastilles/statuts du kanban reflètent le changement sans que Gilles ait à recharger à la main.
async function reloadOpenNexioTabs() {
  const tabs = await chrome.tabs.query({ url: "https://nexio.gillescobigo.com/*" });
  tabs.forEach((t) => t.id && chrome.tabs.reload(t.id));
}

async function handleExtractedPage(apiUrl, token, page, rawTextWithUrl, tabId) {
  try {
    if (page.isCompany) {
      const { pendingContactId } = await chrome.storage.session.get("pendingContactId");

      const company = await apiPost(apiUrl, token, "/companies/extract", {
        rawText: rawTextWithUrl,
        contactId: pendingContactId || undefined,
      });

      if (pendingContactId) {
        await chrome.storage.session.remove(["pendingContactId", "pendingCompany"]);
        status.textContent = `Entreprise "${company.name}" liée au contact. ✓ Fermeture de l'onglet…`;
      } else {
        status.textContent = `Entreprise "${company.name}" créée/mise à jour (aucun contact en attente à lier). ✓ Fermeture de l'onglet…`;
      }
      await reloadOpenNexioTabs();
      closeTabSoon(tabId);
    } else {
      const extracted = await apiPost(apiUrl, token, "/contacts/extract", {
        rawText: rawTextWithUrl,
      });

      const contactPayload = {
        name: extracted.name,
        linkedinUrl: extracted.linkedinUrl || page.url,
        ...(extracted.company ? { company: extracted.company } : {}),
        ...(extracted.jobTitle ? { jobTitle: extracted.jobTitle } : {}),
        ...(extracted.location ? { location: extracted.location } : {}),
      };

      const contact = await apiPost(apiUrl, token, "/contacts", contactPayload);
      await reloadOpenNexioTabs();

      const contactLabel =
        contact.outcome === "unchanged"
          ? `Contact "${contact.name}" déjà en base`
          : contact.outcome === "enriched"
            ? `Contact "${contact.name}" déjà en base, complété avec les nouvelles infos`
            : `Contact "${contact.name}" créé`;

      if (!contact.needsCompanyInfo) {
        // Entreprise déjà connue et enrichie (ce contact ou un collègue déjà traité) :
        // rien de plus à faire, pas la peine d'ouvrir la page entreprise.
        status.textContent = `${contactLabel}. Entreprise déjà renseignée. ✓`;
      } else if (page.firstCompany) {
        status.textContent = `${contactLabel}. Il manque les infos de son entreprise.`;
        await chrome.storage.session.set({
          pendingContactId: contact.id,
          pendingCompany: page.firstCompany,
        });
        showOpenCompanyButton(page.firstCompany);
      } else if (!page.experienceHeadingFound) {
        // Section Expériences pas encore chargée par LinkedIn (chargement différé au scroll) :
        // pas la peine de proposer un lien manuel tout de suite, un vrai scroll + reclic suffit.
        status.textContent = `${contactLabel}. Section Expériences pas encore chargée sur LinkedIn — scrolle jusqu'à elle sur la page, puis reclique sur "Extraire".`;
      } else {
        status.textContent = `${contactLabel}. Il manque les infos de son entreprise, aucun lien détecté automatiquement dans les Expériences.`;
        showManualCompanyInput(contact.id);
      }
    }
  } catch (err) {
    status.textContent = `Échec : ${err.message}`;
    showRawTextFallback(page.rawText, page.url);
  }
}

diagnoseButton.addEventListener("click", async () => {
  if (diagnoseButton.disabled) return;
  diagnoseButton.disabled = true;
  const originalLabel = diagnoseButton.textContent;
  diagnoseButton.textContent = "Diagnostic en cours…";
  status.textContent = "";

  try {
    const tab = await getActiveLinkedInTab();
    if (!tab) {
      status.textContent = "Ouvre un profil ou une page entreprise LinkedIn d'abord.";
      return;
    }

    const response = await sendToContentScript(tab.id, { type: "NEXIO_DIAGNOSE" });
    if (!response?.dump) {
      status.textContent = "Diagnostic impossible sur cette page.";
      return;
    }

    const text = `${response.dump}\n\nURL : ${response.url}`;

    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Diagnostic copié — colle-le à Claude pour ajuster les sélecteurs.";
    } catch {
      status.textContent = "Échec de la copie dans le presse-papiers.";
    }
  } finally {
    diagnoseButton.disabled = false;
    diagnoseButton.textContent = originalLabel;
  }
});

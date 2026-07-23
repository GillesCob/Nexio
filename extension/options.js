const apiUrlInput = document.getElementById("api-url");
const tokenInput = document.getElementById("token");
const saveButton = document.getElementById("save-btn");
const status = document.getElementById("status");

const DEFAULT_API_URL = "https://nexio-api.gillescobigo.com";

chrome.storage.local.get(["apiUrl", "token"], (data) => {
  apiUrlInput.value = data.apiUrl || DEFAULT_API_URL;
  tokenInput.value = data.token || "";
});

saveButton.addEventListener("click", () => {
  const apiUrl = apiUrlInput.value.trim().replace(/\/$/, "");
  const token = tokenInput.value.trim();

  chrome.storage.local.set({ apiUrl, token }, () => {
    status.textContent = "Enregistré.";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  });
});

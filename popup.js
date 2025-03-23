async function loadSettings() {
  chrome.storage.local.get(["serverUrl", "apiKey"], (data) => {
    document.getElementById("serverUrl").value = data.serverUrl || "";
    document.getElementById("apiKey").value = data.apiKey || "";
  });
}

function saveSettings() {
  const serverUrl = document.getElementById("serverUrl").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();
  chrome.storage.local.set({ serverUrl, apiKey }, () => {
    updateStatus("Settings saved.", "#22c55e");
  });
}

function updateStatus(text, color) {
  const el = document.getElementById("status");
  el.textContent = text;
  el.style.color = color;
}

document.getElementById("saveBtn").addEventListener("click", saveSettings);

loadSettings();

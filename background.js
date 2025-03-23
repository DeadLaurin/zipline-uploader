chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "upload-image",
    title: "Upload image to Zipline",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "upload-page-screenshot",
    title: "Take screenshot & upload to Zipline",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "upload-image") {
    fetch(info.srcUrl)
      .then(res => res.blob())
      .then(blob => uploadBlob(blob, "image.png", tab));
  }
  if (info.menuItemId === "upload-page-screenshot") {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => uploadBlob(blob, "screenshot.png", tab));
    });
  }
});

function uploadBlob(blob, filename, tab) {
  chrome.storage.local.get(["serverUrl", "apiKey"], async (data) => {
    const formData = new FormData();
    formData.append("file", blob, filename);

    try {
      const res = await fetch(`${data.serverUrl}/api/upload`, {
        method: "POST",
        headers: { Authorization: data.apiKey },
        body: formData
      });

      const json = await res.json();
      const url = json.files?.[0]?.url || json.url;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => navigator.clipboard.writeText(url),
        args: [url]
      });

      chrome.notifications.create("", {
        type: "basic",
        iconUrl: "icon48.png",
        title: "Uploaded to Zipline",
        message: url
      });
    } catch (e) {
      chrome.notifications.create("", {
        type: "basic",
        iconUrl: "icon48.png",
        title: "Upload Error",
        message: e.message
      });
    }
  });
}

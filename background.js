// Keep track of the extension state
let state = {
  isEnabled: false,
};

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "toggleborders":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && isAllowedUrl(tabs[0].url)) {
          toggleborders(tabs[0]);
        }
      });
      break;
    case "getState":
      sendResponse({ isEnabled: state.isEnabled });
      break;
  }
  return true; // Keep message channel open for async response
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    state.isEnabled &&
    isAllowedUrl(tab.url)
  ) {
    chrome.tabs
      .sendMessage(tabId, {
        action: "toggleborders",
        force: true,
      })
      .catch(() => {
        // If content script isn't ready, inject it
        injectContentScript(tab);
      });
  }
});

function isAllowedUrl(url) {
  // Check if URL is valid and not a restricted page
  return (
    url &&
    !url.startsWith("chrome://") &&
    !url.startsWith("edge://") &&
    !url.startsWith("about:") &&
    !url.startsWith("chrome-extension://")
  );
}

async function toggleborders(tab) {
  if (!isAllowedUrl(tab.url)) {
    console.log("Cannot access restricted URL");
    return;
  }

  try {
    // Try to send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: "toggleborders",
    });
  } catch (error) {
    try {
      // If content script isn't injected yet, inject it
      await injectContentScript(tab);
      // Then send the toggle message
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleborders",
      });
    } catch (err) {
      console.log("Failed to inject content script:", err);
      return;
    }
  }

  // Update state
  state.isEnabled = !state.isEnabled;

  // Save state
  chrome.storage.local.set({ bordersEnabled: state.isEnabled });
}

async function injectContentScript(tab) {
  if (!isAllowedUrl(tab.url)) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (error) {
    console.log("Script injection failed:", error);
  }
}

// Initialize state from storage
chrome.storage.local.get(["bordersEnabled"], (result) => {
  state.isEnabled = result.bordersEnabled || false;
});

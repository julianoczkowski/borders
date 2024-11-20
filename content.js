let bordersEnabled = false;

// Error handling wrapper for message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case "toggleborders":
        bordersEnabled = request.force ? true : !bordersEnabled;
        toggleborders();
        break;
      case "getState":
        sendResponse({ enabled: bordersEnabled });
        break;
    }
  } catch (error) {
    console.error("borders error:", error);
    cleanup();
  }
});

function toggleborders() {
  try {
    if (bordersEnabled) {
      document.body.classList.add("borders-active");

      const style = document.createElement("style");
      style.id = "borders-style";
      style.textContent = `
        .borders-active *:not(path) {
          outline: 1px solid rgb(3, 135, 250) !important;
        }
        .borders-active *:not(path) *:not(path) {
          outline: 1px solid rgba(0, 128, 255) !important;
        }
        .borders-active *:not(path) *:not(path) *:not(path) {
          outline: 1px solid rgba(0, 123, 255) !important;
        }
        .borders-active *:not(path) *:not(path) *:not(path) *:not(path) {
          outline: 1px solid rgb(0, 94, 255) !important;
        }
        .borders-active *:not(path) *:not(path) *:not(path) *:not(path) *:not(path) {
          outline: 1px solid rgb(0, 128, 255) !important;
        }
        .borders-active *:not(path) *:not(path) *:not(path) *:not(path) *:not(path) *:not(path) {
          outline: 1px solid rgb(40, 96, 249) !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      cleanup();
    }
  } catch (error) {
    console.error("Toggle error:", error);
    cleanup();
  }
}

function cleanup() {
  const existingStyle = document.getElementById("borders-style");
  if (existingStyle) {
    existingStyle.remove();
  }
  document.body.classList.remove("borders-active");
}

// Initialize with error handling
try {
  chrome.storage.local.get(["bordersEnabled"], (result) => {
    bordersEnabled = result.bordersEnabled || false;
    if (bordersEnabled) {
      toggleborders();
    }
  });
} catch (error) {
  console.error("Initialization error:", error);
}

// Cleanup on window unload
window.addEventListener("unload", cleanup, { passive: true });

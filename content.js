let bordersEnabled = false;
let isCtrlPressed = false;
let overlay = null;

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

// Create and add overlay element
function createOverlay() {
  // Remove existing overlay only, not all borders
  const existingOverlay = document.querySelector(".borders-element-info");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create the overlay container
  overlay = document.createElement("div");
  overlay.className = "borders-element-info";
  overlay.setAttribute(
    "style",
    `
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    background: #1e1e1e !important;
    color: #ffffff !important;
    font-family: Consolas, Monaco, 'Courier New', monospace !important;
    padding: 12px 16px !important;
    font-size: 13px !important;
    z-index: 2147483647 !important;
    border-top: 1px solid #333 !important;
    pointer-events: none !important;
    line-height: 1.4 !important;
    height: auto !important;
    min-height: 40px !important;
    display: none !important;
  `
  );

  // Append to body
  document.documentElement.appendChild(overlay);
}

// Handle keyboard events
document.addEventListener("keydown", (e) => {
  if (e.key === "Control") {
    isCtrlPressed = true;
    if (bordersEnabled && overlay) {
      overlay.style.display = "block";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Control") {
    isCtrlPressed = false;
    if (overlay) {
      overlay.style.display = "none";
    }
  }
});

// Handle mouse movement
document.addEventListener("mousemove", (e) => {
  if (!bordersEnabled || !isCtrlPressed) return;

  const element = e.target;
  if (!overlay) createOverlay();

  // Get element details
  const classes = Array.from(element.classList).join(" ");
  const id = element.id;

  // Create spans with inline styles to avoid CSS conflicts
  const info = `
    You're hovering on = { node: 
    <span style="color: #4f9fe6 !important;">${element.tagName.toLowerCase()}</span>
    ; classes: 
    <span style="color: #4ec9b0 !important;">${classes}</span>
    ; id: 
    <span style="color: #dcdcaa !important;">${id || ""}</span>
    ; }
  `;

  overlay.innerHTML = info;
  overlay.style.display = "block";
});

function toggleborders() {
  try {
    if (bordersEnabled) {
      document.body.classList.add("borders-active");

      // Inject borders styles if not already present
      if (!document.getElementById("borders-style")) {
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
      }

      // Create overlay but keep it hidden until CTRL is pressed
      createOverlay();
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

  // Remove any existing overlays
  const existingOverlay = document.querySelector(".borders-element-info");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  overlay = null;
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

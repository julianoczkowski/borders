document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");

  // Load saved state
  chrome.storage.local.get(["bordersEnabled"], (result) => {
    if (result.bordersEnabled) {
      toggleButton.classList.add("active");
      toggleButton.textContent = "Disable Borders";
    }
  });

  // Handle toggle button click
  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ action: "toggleborders" });
      toggleButton.classList.toggle("active");

      if (toggleButton.classList.contains("active")) {
        toggleButton.textContent = "Disable Borders";
      } else {
        toggleButton.textContent = "Enable Borders";
      }

      // Save state
      chrome.storage.local.set({
        bordersEnabled: toggleButton.classList.contains("active"),
      });
    });
  });
});

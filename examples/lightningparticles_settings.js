// Settings UI
class SettingsUI {
  constructor(config, addButton = false, onUpdate) {
    this.config = config;

    this.onUpdate = onUpdate;
    this.addButton = addButton;

    // Create and append settings button and modal to the body
    if (this.addButton) {

      this.createSettingsUI();
    }

    this.modal = document.getElementById("settings-modal");
    this.settingsBtn = document.getElementById("settings-btn");
    this.closeBtn = this.modal.querySelector(".close");
    this.settingsForm = document.getElementById("settings-form");
    this.downloadBtn = document.getElementById("download-btn");

    if (this.settingsBtn) {
      this.settingsBtn.onclick = () => this.openModal();
    }
    this.closeBtn.onclick = () => this.closeModal();
    this.downloadBtn.onclick = () => this.downloadSettings(); // Add event listener for download button
    window.onclick = (event) => {
      if (event.target == this.modal) {
        this.closeModal();
      }
    };

    this.createSettingsForm();
  }

  createSettingsUI() {

    const settingsBtn = document.createElement("button");
    settingsBtn.id = "settings-btn";
    settingsBtn.textContent = "Settings";
    document.body.appendChild(settingsBtn);

    const settingsModal = document.createElement("div");
    settingsModal.id = "settings-modal";
    settingsModal.className = "modal";
    settingsModal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2 style="margin: 0px 0px 10px;">Effect Settings</h2>
        <div id="settings-form"></div>
        <button id="download-btn">Download Settings</button>
      </div>
    `;

    document.body.appendChild(settingsModal);

    /* add event listener to settings button to open the modal */
    settingsBtn.addEventListener("click", () => this.openModal());
  }

  createSettingsForm() {
    this.settingsForm.innerHTML = ""; // Clear form before rendering
    this.settingsForm.style.display = "grid";
    this.settingsForm.style.gridTemplateColumns = "1fr 1fr"; // Two columns

    // Group settings by type
    const colorSettings = [];
    const checkboxSettings = [];
    const sliderSettings = [];

    for (let [key, value] of Object.entries(this.config)) {
      if (typeof value === "string" && value.startsWith("#")) {
        colorSettings.push({ key, value });
      } else if (typeof value === "boolean") {
        checkboxSettings.push({ key, value });
      } else if (typeof value === "number" && !key.endsWith("Min") && !key.endsWith("Max")) {
        sliderSettings.push({ key, value });
      }
    }

    // Render color settings
    colorSettings.forEach(({ key, value }) => {
      this.createSettingGroup(key, value, "color");
    });

    // Add a new line for separation
    this.settingsForm.appendChild(document.createElement("div"));

    // Render checkbox settings
    checkboxSettings.forEach(({ key, value }) => {
      this.createSettingGroup(key, value, "checkbox");
    });

    // Add a new line for separation
    this.settingsForm.appendChild(document.createElement("div"));

    // Render slider settings
    sliderSettings.forEach(({ key, value }) => {
      this.createSettingGroup(key, value, "range");
    });
  }

  createSettingGroup(key, value, type) {
    let settingGroup = document.createElement("div");
    settingGroup.className = "setting-group";

    if (type === "checkbox") {
      settingGroup.style.gridColumn = "span 2"; // Make checkbox settings span both columns
    }

    let label = document.createElement("label");
    label.textContent = this.formatLabel(key);
    settingGroup.appendChild(label);

    let input = document.createElement("input");
    let valueDisplay = document.createElement("span"); // Display value span

    if (type === "range") {
      input.type = "range";
      input.min = this.config[key + "Min"] || 0; // Set min if defined
      input.max = this.config[key + "Max"] || value * 2; // Set max if defined
      input.step = Math.max(0.01, (input.max - input.min) / 100); // Larger steps
      input.value = value.toFixed(2); // Round to 2 decimal places
      valueDisplay.textContent = value.toFixed(2); // Show initial value

      // Update value display on input change
      input.oninput = () => (valueDisplay.textContent = parseFloat(input.value).toFixed(2));
    } else if (type === "checkbox") {
      input.type = "checkbox";
      input.checked = value;
    } else if (type === "color") {
      input.type = "color";
      input.value = value;
    } else {
      input.type = "text";
      input.value = value;
    }

    input.id = key;
    input.onchange = () => this.updateSetting(key, input);

    settingGroup.appendChild(input);
    if (type === "range") {
      settingGroup.appendChild(valueDisplay); // Add value display next to slider
    }
    this.settingsForm.appendChild(settingGroup);
  }

  updateSetting(key, input) {
    let value =
      input.type === "checkbox"
        ? input.checked
        : parseFloat(input.value) || input.value;
    this.config[key] = value;
    this.onUpdate(this.config);
  }

  openModal() {
    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
  }

  formatLabel(key) {
    return key
      .split(/(?=[A-Z])/)
      .join(" ")
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase());
  }

  downloadSettings() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.config, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lightning_settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

// Initialize the settings UI and lightning effect
document.addEventListener("DOMContentLoaded", () => {
  new SettingsUI(config, true, (newConfig) => {
    lightningEffect.updateConfig(newConfig);
  });
});

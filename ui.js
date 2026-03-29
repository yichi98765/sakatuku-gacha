// === UI: Theme, Sound, Navigation, Banner, Charge, UI Updates ===

// --- Theme ---
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.getElementById("btn-theme").textContent = state.theme === "dark" ? "\u{1F319}" : "\u{2600}\u{FE0F}";
}

// --- Sound ---
function toggleSound() {
  soundManager.init();
  state.soundEnabled = soundManager.toggle();
  applySoundIcon();
  saveState();
}

function applySoundIcon() {
  const btn = document.getElementById("btn-sound");
  btn.textContent = state.soundEnabled ? "\u{1F50A}" : "\u{1F507}";
  btn.classList.toggle("muted", !state.soundEnabled);
  soundManager.enabled = state.soundEnabled;
}

// --- Page Navigation ---
function switchPage(page) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.querySelectorAll(".main-tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`page-${page}`).style.display = "block";
  document.querySelector(`.main-tab[data-page="${page}"]`).classList.add("active");

  if (page === "collection") renderCollection();
}

// --- Banner ---
function initBannerTabs() {
  state.banner = "normal";
  updateBannerDisplay();
}

function updateBannerDisplay() {
  const config = GACHA_CONFIG[state.banner];
  document.getElementById("banner-title").textContent = config.title;
  document.getElementById("banner-desc").textContent = config.desc;
  const r = config.rates;
  document.getElementById("banner-rates").innerHTML =
    `<span>\u2605 3: ${r.star3}.000% / \u2605 2: ${r.star2}.000% / \u2605 1: ${r.star1}.000%</span>`;
}

// --- GB Charge ---
function openCharge() {
  soundManager.init();
  soundManager.click();
  document.getElementById("charge-overlay").style.display = "flex";
}

function closeCharge() {
  document.getElementById("charge-overlay").style.display = "none";
}

function chargeGB(amount) {
  state.gb += amount;
  updateUI();
  saveState();
  soundManager.exchangeSuccess();
  closeCharge();
}

// --- UI Update ---
function updateUI() {
  document.getElementById("gb-count").textContent = state.gb.toLocaleString();
  document.getElementById("medal-count").textContent = state.medals;
  document.getElementById("medal-exchange-count").textContent = state.medals;
  document.getElementById("total-pulls").textContent = state.totalPulls;
  document.getElementById("total-gb-spent").textContent = state.totalGBSpent.toLocaleString();
  document.getElementById("yen-spent").textContent = formatYen(state.totalGBSpent);

  const singleBtn = document.getElementById("btn-single");
  const multiBtn = document.getElementById("btn-multi");
  singleBtn.disabled = state.gb < 300;
  multiBtn.disabled = state.gb < 3000;

  updateHistory();
}

// --- Toggle Sections ---
function toggleSection(name) {
  const content = document.getElementById(`${name}-content`);
  const toggle = document.getElementById(`${name}-toggle`);
  if (content.style.display === "none") {
    content.style.display = "block";
    toggle.textContent = "\u25B2";
    if (name === "rates") renderRates();
  } else {
    content.style.display = "none";
    toggle.textContent = "\u25BC";
  }
}

// --- Custom Confirm Modal ---
function showConfirm(title, bodyHtml, icon = "\u{1F4CA}") {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    document.getElementById("confirm-icon").textContent = icon;
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-body").innerHTML = bodyHtml;
    overlay.style.display = "flex";

    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    function cleanup() {
      overlay.style.display = "none";
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}

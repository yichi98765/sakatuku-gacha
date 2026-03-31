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
  if (!GACHA_CONFIG[state.banner]) state.banner = "normal";
  updateBannerDisplay();
}

function switchBanner(bannerKey) {
  soundManager.init();
  soundManager.click();
  state.banner = bannerKey;
  document.querySelectorAll(".banner-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.banner-tab[data-banner="${bannerKey}"]`).classList.add("active");
  updateBannerDisplay();
  renderRates();
  saveState();
}

function updateBannerDisplay() {
  const config = GACHA_CONFIG[state.banner];
  const isPickup = state.banner === "pickup";
  document.getElementById("banner-title").textContent = config.title;
  document.getElementById("banner-desc").textContent = config.desc;
  document.getElementById("banner-badge").textContent = isPickup ? "PICK UP" : "SP SCOUT";
  document.getElementById("banner-card").classList.toggle("pickup", isPickup);

  // ピックアップ選手リスト表示
  const pickupList = document.getElementById("banner-pickup-list");
  if (isPickup && typeof PICKUP_STAR3 !== "undefined") {
    pickupList.style.display = "block";
    pickupList.innerHTML = PICKUP_STAR3.map(p => {
      const flag = getFlag(p.country);
      return `<span class="pickup-player">${flag} ${p.name} <small>(${p.position})</small></span>`;
    }).join("");
  } else {
    pickupList.style.display = "none";
  }

  const r = config.rates;
  if (isPickup) {
    document.getElementById("banner-rates").innerHTML =
      `<span>\u2605 3: ${r.star3.toFixed(3)}% (PU: ${config.pickupRate.toFixed(3)}%) / \u2605 2: ${r.star2.toFixed(3)}% / \u2605 1: ${r.star1.toFixed(3)}%</span>`;
  } else {
    document.getElementById("banner-rates").innerHTML =
      `<span>\u2605 3: ${r.star3}.000% / \u2605 2: ${r.star2}.000% / \u2605 1: ${r.star1}.000%</span>`;
  }
}

// --- GB Charge ---
function openCharge() {
  soundManager.init();
  soundManager.click();
  openOverlay(document.getElementById("charge-overlay"));
}

function closeCharge() {
  closeOverlay(document.getElementById("charge-overlay"));
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
    openOverlay(overlay);

    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    function cleanup() {
      closeOverlay(overlay);
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}

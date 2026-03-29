// === サカつく2026 ガチャシミュレーター (Full Version) ===

const GACHA_CONFIG = {
  normal: {
    title: "SP選手スカウト",
    desc: "★3 SP選手を獲得しよう！",
    rates: { star3: 5, star2: 10, star1: 85 },
    pickupRate: 0,
  }
};

const MAX_DUPE = 6; // 最大凸数（凸1〜凸6）

// === State ===
let state = {
  banner: "normal",
  gb: 50000,
  medals: 0,
  totalPulls: 0,
  totalGBSpent: 0,
  history: [],       // { rarity, player, isNew, pullNum }
  dupes: {},         // { playerName: count }
  stats: { star3: 0, star2: 0, star1: 0 },
  theme: "dark",
  soundEnabled: true,
};

let animationTimeouts = [];
let isAnimating = false;

// === Storage Keys ===
const STORAGE_KEY = "sakatuku2026_gacha_state";

// === Initialize ===
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initBannerTabs();
  updateUI();
  renderRates();
  soundManager.init();
  applyTheme();
  applySoundIcon();
});

// === localStorage ===
function saveState() {
  const toSave = {
    banner: state.banner,
    gb: state.gb,
    medals: state.medals,
    totalPulls: state.totalPulls,
    totalGBSpent: state.totalGBSpent,
    history: state.history.slice(0, 500), // keep last 500
    dupes: state.dupes,
    stats: state.stats,
    theme: state.theme,
    soundEnabled: state.soundEnabled,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) { /* quota exceeded, ignore */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const data = JSON.parse(saved);
    state = { ...state, ...data };
  } catch (e) { /* corrupt data, ignore */ }
}

// === Theme ===
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.getElementById("btn-theme").textContent = state.theme === "dark" ? "\u{1F319}" : "\u{2600}\u{FE0F}";
}

// === Sound ===
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

// === Page Navigation ===
function switchPage(page) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.querySelectorAll(".main-tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`page-${page}`).style.display = "block";
  document.querySelector(`.main-tab[data-page="${page}"]`).classList.add("active");

  if (page === "collection") renderCollection();
}

// === Banner ===
function initBannerTabs() {
  // ピックアップ削除済み - 通常スカウト固定
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

// === GB Management ===
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

// === Gacha Pull ===
function doPull(count) {
  soundManager.init();
  const cost = count === 1 ? 300 : 3000;

  if (state.gb < cost) {
    openCharge();
    return;
  }

  state.gb -= cost;
  state.totalGBSpent += cost;
  isAnimating = true;

  const config = GACHA_CONFIG[state.banner];
  const results = [];

  for (let i = 0; i < count; i++) {
    results.push(pullOne(config));
  }

  // 10連: ★2以上1枚確定
  if (count === 10) {
    const hasStar2OrAbove = results.some(r => r.rarity >= 2);
    if (!hasStar2OrAbove) {
      results[9] = pullOne(config, 2);
    }
  }

  // Update state
  results.forEach(r => {
    state.totalPulls++;
    state.medals = Math.min(state.medals + 1, 200);
    const dupeKey = r.player.name;
    const prevDupes = state.dupes[dupeKey] || 0;
    state.dupes[dupeKey] = prevDupes + 1;
    r.isNew = prevDupes === 0;
    r.dupeCount = state.dupes[dupeKey];
    r.pullNum = state.totalPulls;
    state.history.unshift(r);
    state.stats[`star${r.rarity}`]++;
  });

  updateUI();
  saveState();
  showResults(results);
  soundManager.gachaStart();
}

function pullOne(config, minRarity = 1) {
  const roll = Math.random() * 100;
  let rarity;

  if (minRarity >= 3) {
    rarity = 3;
  } else if (minRarity >= 2) {
    rarity = roll < config.rates.star3 ? 3 : 2;
  } else {
    if (roll < config.rates.star3) rarity = 3;
    else if (roll < config.rates.star3 + config.rates.star2) rarity = 2;
    else rarity = 1;
  }

  const pool = rarity === 3 ? PLAYERS.star3 : rarity === 2 ? PLAYERS.star2 : PLAYERS.star1;
  const player = pool[Math.floor(Math.random() * pool.length)];

  return { rarity, player, isNew: false, dupeCount: 0 };
}

// === Show Results ===
function showResults(results) {
  const overlay = document.getElementById("overlay");
  const container = document.getElementById("cards-container");
  const resultContainer = document.getElementById("result-container");
  const hasStar3 = results.some(r => r.rarity === 3);
  const cinematic = document.getElementById("star3-cinematic");

  document.getElementById("result-title").textContent =
    results.length === 1 ? "スカウト結果" : "10連スカウト結果";

  container.innerHTML = "";
  resultContainer.classList.toggle("has-star3", hasStar3);

  // Show/hide buttons
  document.getElementById("btn-skip").style.display = "inline-block";
  document.getElementById("btn-close-result").style.display = "none";

  // Manager corridor animation for ★3
  if (hasStar3) {
    cinematic.style.display = "block";
    cinematic.classList.remove("fade-out");
    // Reset all animations
    const animEls = cinematic.querySelectorAll(".manager-figure, .trophy-area, .trophy-glow, .trophy-rays, .cinematic-text, .led-strip, .bench-obj, .corridor-scene");
    animEls.forEach(el => { el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; });
    // Also reset child animations
    const managerSvg = cinematic.querySelector(".manager-figure");
    if (managerSvg) { managerSvg.style.animation = "none"; managerSvg.offsetHeight; managerSvg.style.animation = ""; }

    overlay.style.display = "flex";
    soundManager.star3Flash();

    const t1 = setTimeout(() => {
      soundManager.star3Reveal();
    }, 1200);
    animationTimeouts.push(t1);

    const t2 = setTimeout(() => {
      cinematic.classList.add("fade-out");
    }, 3000);
    animationTimeouts.push(t2);

    const t3 = setTimeout(() => {
      cinematic.style.display = "none";
      showStar3Effect();
      buildCards(results, container, hasStar3);
    }, 3500);
    animationTimeouts.push(t3);
  } else {
    cinematic.style.display = "none";
    overlay.style.display = "flex";
    buildCards(results, container, hasStar3);
  }
}

function buildCards(results, container, hasStar3) {
  results.forEach((result, index) => {
    container.appendChild(createCard(result, index, hasStar3));
  });

  // Auto-flip
  const baseDelay = hasStar3 ? 400 : 200;
  results.forEach((result, index) => {
    const t = setTimeout(() => {
      const card = container.children[index];
      if (card && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        soundManager.cardFlip();
        if (result.rarity === 3) {
          setTimeout(() => soundManager.star3Reveal(), 300);
        } else if (result.rarity === 2) {
          setTimeout(() => soundManager.star2Reveal(), 300);
        } else {
          setTimeout(() => soundManager.star1Reveal(), 300);
        }
      }
    }, baseDelay + index * 300);
    animationTimeouts.push(t);
  });

  // Show close button after all cards flip
  const totalTime = baseDelay + results.length * 300 + 500;
  const closeT = setTimeout(() => {
    document.getElementById("btn-skip").style.display = "none";
    document.getElementById("btn-close-result").style.display = "inline-block";
    isAnimating = false;
  }, totalTime);
  animationTimeouts.push(closeT);
}

// 凸/重複表示
// ★3: ドット形式(凸1〜凸6 Max)  ★2: ×N回  ★1: 表示なし
function renderDupeDisplay(dupeCount, rarity, size = "sm") {
  if (dupeCount <= 0) return "";
  if (rarity === 3) {
    const level = Math.min(dupeCount, MAX_DUPE);
    const isMax = level >= MAX_DUPE;
    const cls = size === "lg" ? "dupe-dots lg" : "dupe-dots";
    let dots = `<div class="${cls}${isMax ? ' max' : ''}">`;
    for (let i = 1; i <= MAX_DUPE; i++) {
      dots += `<span class="dupe-dot${i <= level ? ' filled' : ''}"></span>`;
    }
    dots += `<span class="dupe-label">${isMax ? '凸MAX' : '凸' + level}</span>`;
    dots += `</div>`;
    return dots;
  } else if (rarity === 2) {
    const totalCount = dupeCount + 1; // dupeCount is dupes, +1 for the original
    const cls = size === "lg" ? "dupe-text lg" : "dupe-text";
    return `<div class="${cls}">\u00D7${totalCount}回</div>`;
  }
  // ★1: 表示なし
  return "";
}

function createCard(result, index, hasStar3) {
  const card = document.createElement("div");
  card.className = "card";
  if (result.rarity === 3) card.classList.add("has-star3");

  const starStr = "\u2605".repeat(result.rarity);
  const p = result.player;
  const flag = getFlag(p.country);
  const posGroup = getPosGroup(p.position);

  const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[p.name] : null;
  const imgHtml = imgUrl
    ? `<div class="card-img"><img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='${flag}'"></div>`
    : `<div class="card-flag">${flag}</div>`;

  let dupeHtml = "";
  if (result.rarity === 3 && result.dupeCount > 1) {
    dupeHtml = renderDupeDisplay(result.dupeCount - 1, 3);
  } else if (result.rarity === 2 && result.dupeCount > 1) {
    dupeHtml = renderDupeDisplay(result.dupeCount - 1, 2);
  }

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front"></div>
      <div class="card-back star${result.rarity}">
        ${result.isNew ? '<div class="card-new">NEW</div>' : ''}
        ${imgHtml}
        <div class="card-stars">${starStr}</div>
        <div class="card-position ${posGroup}">${p.position}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-country">${p.country}</div>
        ${dupeHtml}
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    if (!card.classList.contains("flipped")) {
      card.classList.add("flipped");
      soundManager.cardFlip();
    }
  });

  return card;
}

function skipAnimation() {
  animationTimeouts.forEach(t => clearTimeout(t));
  animationTimeouts = [];

  document.querySelectorAll(".card:not(.flipped)").forEach(card => {
    card.classList.add("flipped");
  });

  document.getElementById("btn-skip").style.display = "none";
  document.getElementById("btn-close-result").style.display = "inline-block";
  const cinematicEl = document.getElementById("star3-cinematic");
  if (cinematicEl) cinematicEl.style.display = "none";
  isAnimating = false;
}

function showStar3Effect() {
  const effect = document.createElement("div");
  effect.className = "star3-reveal";
  const flash = document.createElement("div");
  flash.className = "flash";
  effect.appendChild(flash);

  const particles = document.createElement("div");
  particles.className = "particles";
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = (Math.PI * 2 * i) / 24;
    const dist = 100 + Math.random() * 200;
    p.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    p.style.animationDelay = `${Math.random() * 0.3}s`;
    particles.appendChild(p);
  }
  effect.appendChild(particles);
  document.body.appendChild(effect);
  setTimeout(() => effect.remove(), 2000);
}

function closeResult() {
  document.getElementById("overlay").style.display = "none";
  animationTimeouts.forEach(t => clearTimeout(t));
  animationTimeouts = [];
  isAnimating = false;
}

// === Medal Exchange ===
function openExchange() {
  soundManager.init();
  soundManager.click();
  const overlay = document.getElementById("exchange-overlay");
  const container = document.getElementById("exchange-players");
  document.getElementById("exchange-medal-display").textContent = state.medals;

  container.innerHTML = "";
  PLAYERS.star3.forEach(player => {
    const canExchange = state.medals >= 200;
    const flag = getFlag(player.country);
    const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[player.name] : null;
    const imgHtml = imgUrl
      ? `<div class="exchange-img"><img src="${imgUrl}" alt="${player.name}" onerror="this.parentElement.innerHTML='${flag}'"></div>`
      : `<div style="font-size:28px;">${flag}</div>`;
    const div = document.createElement("div");
    div.className = "exchange-player-card";
    div.innerHTML = `
      ${imgHtml}
      <div class="exchange-player-info">
        <div class="name">\u2605 3 ${player.name}</div>
        <div class="detail">${player.position} / ${player.country}</div>
      </div>
      <button class="btn btn-exchange-get" ${canExchange ? '' : 'disabled'}
        onclick="exchangePlayer('${player.name.replace(/'/g, "\\'")}')">
        交換 (200枚)
      </button>
    `;
    container.appendChild(div);
  });

  overlay.style.display = "flex";
}

function exchangePlayer(playerName) {
  if (state.medals < 200) return;
  const player = PLAYERS.star3.find(p => p.name === playerName);
  if (!player) return;

  state.medals -= 200;
  const dupeKey = player.name;
  const prevDupes = state.dupes[dupeKey] || 0;
  state.dupes[dupeKey] = prevDupes + 1;
  const isNew = prevDupes === 0;

  state.stats.star3++;
  state.history.unshift({
    rarity: 3, player, isNew,
    dupeCount: state.dupes[dupeKey],
    pullNum: "交換"
  });

  closeExchange();
  updateUI();
  saveState();
  soundManager.exchangeSuccess();
  showResults([{ rarity: 3, player, isNew, dupeCount: state.dupes[dupeKey] }]);
}

function closeExchange() {
  document.getElementById("exchange-overlay").style.display = "none";
}

// === Reset ===
function resetAll() {
  if (!confirm("すべてのデータをリセットしますか？")) return;
  state = {
    banner: state.banner,
    gb: 50000,
    medals: 0,
    totalPulls: 0,
    totalGBSpent: 0,
    history: [],
    dupes: {},
    stats: { star3: 0, star2: 0, star1: 0 },
    theme: state.theme,
    soundEnabled: state.soundEnabled,
  };
  updateUI();
  saveState();
  document.getElementById("history-content").style.display = "none";
  document.getElementById("history-toggle").textContent = "\u25BC";
}

// === UI Update ===
function updateUI() {
  document.getElementById("gb-count").textContent = state.gb.toLocaleString();
  document.getElementById("medal-count").textContent = state.medals;
  document.getElementById("medal-exchange-count").textContent = state.medals;
  document.getElementById("total-pulls").textContent = state.totalPulls;
  document.getElementById("total-gb-spent").textContent = state.totalGBSpent.toLocaleString();
  // Update yen equivalent
  const yenSpent = Math.ceil(state.totalGBSpent / 1.1);
  document.getElementById("yen-spent").textContent = "¥" + yenSpent.toLocaleString();

  // Disable buttons if not enough GB
  const singleBtn = document.getElementById("btn-single");
  const multiBtn = document.getElementById("btn-multi");
  singleBtn.disabled = state.gb < 300;
  multiBtn.disabled = state.gb < 3000;

  updateHistory();
}

function updateHistory() {
  const statsEl = document.getElementById("history-stats");
  const listEl = document.getElementById("history-list");
  const total = state.stats.star3 + state.stats.star2 + state.stats.star1;

  const rate3 = total > 0 ? ((state.stats.star3 / total) * 100).toFixed(1) : "0.0";
  const rate2 = total > 0 ? ((state.stats.star2 / total) * 100).toFixed(1) : "0.0";
  const rate1 = total > 0 ? ((state.stats.star1 / total) * 100).toFixed(1) : "0.0";

  statsEl.innerHTML = `
    <div class="stat-box star3-stat">
      <div class="label">\u2605 3</div>
      <div class="value">${state.stats.star3}</div>
      <div class="label">${rate3}%</div>
    </div>
    <div class="stat-box star2-stat">
      <div class="label">\u2605 2</div>
      <div class="value">${state.stats.star2}</div>
      <div class="label">${rate2}%</div>
    </div>
    <div class="stat-box star1-stat">
      <div class="label">\u2605 1</div>
      <div class="value">${state.stats.star1}</div>
      <div class="label">${rate1}%</div>
    </div>
  `;

  listEl.innerHTML = state.history.slice(0, 100).map(h => {
    const starStr = "\u2605".repeat(h.rarity);
    const flag = getFlag(h.player.country);
    return `
      <div class="history-entry star${h.rarity}">
        <span class="stars">${starStr}</span>
        <span style="font-size:14px;">${flag}</span>
        <span class="name">${h.player.name}${h.isNew ? ' \u{1F195}' : ''}</span>
        <span class="pull-num">#${h.pullNum}</span>
      </div>
    `;
  }).join("");
}

// === Toggle Sections ===
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

function renderRates() {
  const content = document.getElementById("rates-content");
  const config = GACHA_CONFIG[state.banner];
  const r = config.rates;
  const s3c = PLAYERS.star3.length, s2c = PLAYERS.star2.length, s1c = PLAYERS.star1.length;

  let html = `
    <div style="font-size:13px; font-weight:700; margin-bottom:8px; text-align:center;">提供割合 一覧</div>
    <div style="display:flex; justify-content:center; gap:16px; margin-bottom:12px; font-size:13px;">
      <span style="color:#ffd700;">\u2605 3 \u2014 ${r.star3}.000%</span>
      <span style="color:#aad;">\u2605 2 \u2014 ${r.star2}.000%</span>
      <span style="color:#88a;">\u2605 1 \u2014 ${r.star1}.000%</span>
    </div>
    <table class="rates-table">
      <thead><tr><th>レアリティ</th><th>排出率</th><th>対象人数</th><th>個別確率</th></tr></thead>
      <tbody>
        <tr><td style="color:#ffd700;">\u2605\u2605\u2605</td><td>${r.star3}.000%</td><td>${s3c}人</td><td>0.138%</td></tr>
        <tr><td style="color:#aad;">\u2605\u2605</td><td>${r.star2}.000%</td><td>${s2c}人</td><td>0.208%</td></tr>
        <tr><td style="color:#88a;">\u2605</td><td>${r.star1}.000%</td><td>${s1c}人</td><td>1.517%</td></tr>
      </tbody>
    </table>`;

  // ★3選手一覧
  html += `<div style="margin-top:16px;"><h4 style="color:#ffd700; font-size:13px; margin-bottom:8px;">\u2605 3 選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star3.forEach(p => {
    const posG = getPosGroup(p.position);
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  // ★2選手一覧
  html += `<div style="margin-top:16px;"><h4 style="color:#aad; font-size:13px; margin-bottom:8px;">\u2605 2 選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star2.forEach(p => {
    const posG = getPosGroup(p.position);
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  // ★1選手一覧
  html += `<div style="margin-top:16px;"><h4 style="color:#88a; font-size:13px; margin-bottom:8px;">\u2605 1 選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star1.forEach(p => {
    const posG = getPosGroup(p.position);
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  html += `
    <div style="margin-top:12px; font-size:11px; color:var(--text-muted);">
      ※ 10連スカウトでは\u2605 2以上のSP選手が最低1枚確定<br>
      ※ メダルは1回のスカウトにつき1枚獲得（最大200枚）<br>
      ※ 排出率はゲーム内「提供割合 一覧」からの転記データです
    </div>`;

  content.innerHTML = html;
}

// === Collection (図鑑) ===
let collectionFilter = "all";

function filterCollection(filter) {
  collectionFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add("active");
  renderCollection();
}

function renderCollection() {
  const grid = document.getElementById("collection-grid");
  const allPlayers = getAllPlayers();

  const totalOwned = allPlayers.filter(p => (state.dupes[p.name] || 0) > 0).length;
  const totalPlayers = allPlayers.length;
  const compPct = totalPlayers > 0 ? ((totalOwned / totalPlayers) * 100).toFixed(1) : "0.0";
  document.getElementById("comp-rate").textContent =
    `${totalOwned} / ${totalPlayers} (${compPct}%)`;

  let filtered = allPlayers;
  if (collectionFilter === "star3") filtered = filtered.filter(p => p.rarity === 3);
  else if (collectionFilter === "star2") filtered = filtered.filter(p => p.rarity === 2);
  else if (collectionFilter === "star1") filtered = filtered.filter(p => p.rarity === 1);
  else if (collectionFilter === "owned") filtered = filtered.filter(p => (state.dupes[p.name] || 0) > 0);
  else if (collectionFilter === "unowned") filtered = filtered.filter(p => (state.dupes[p.name] || 0) === 0);

  grid.innerHTML = filtered.map(p => {
    const owned = (state.dupes[p.name] || 0) > 0;
    const dupeCount = state.dupes[p.name] || 0;
    const flag = getFlag(p.country);
    const starStr = "\u2605".repeat(p.rarity);
    const dupeLevel = dupeCount > 1 ? dupeCount - 1 : 0;

    const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[p.name] : null;
    const imgHtml = imgUrl
      ? `<div class="col-img"><img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='${flag}'"></div>`
      : `<div class="col-flag">${flag}</div>`;

    let colDupeHtml = "";
    if (owned && p.rarity === 3 && dupeLevel > 0) {
      colDupeHtml = renderDupeDisplay(dupeLevel, 3);
    } else if (owned && p.rarity === 2 && dupeCount > 1) {
      colDupeHtml = renderDupeDisplay(dupeLevel, 2);
    }

    return `
      <div class="collection-card ${owned ? 'owned' : 'unowned'} star${p.rarity}"
           onclick="showPlayerDetail('${p.name.replace(/'/g, "\\'")}', ${p.rarity})">
        ${imgHtml}
        <div class="col-stars">${starStr}</div>
        <div class="col-name">${p.name}</div>
        <span class="col-pos ${getPosGroup(p.position)}">${p.position}</span>
        ${colDupeHtml}
      </div>`;
  }).join("");
}

function showPlayerDetail(name, rarity) {
  const allPlayers = getAllPlayers();
  const player = allPlayers.find(p => p.name === name && p.rarity === rarity);
  if (!player) return;

  const owned = (state.dupes[player.name] || 0) > 0;
  if (!owned) return; // Can't view unowned

  const dupeCount = state.dupes[player.name] || 0;
  const dupeLevel = dupeCount > 1 ? dupeCount - 1 : 0;
  const flag = getFlag(player.country);
  const starStr = "\u2605".repeat(player.rarity);

  const posGroup = getPosGroup(player.position);

  const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[player.name] : null;
  const imgHtml = imgUrl
    ? `<div class="pd-img"><img src="${imgUrl}" alt="${player.name}" onerror="this.parentElement.innerHTML='${flag}'"></div>`
    : `<div class="pd-flag">${flag}</div>`;

  let dupeDetailHtml = "";
  if (player.rarity === 3) {
    // ★3: 凸ドット＋プログレスバー
    const cappedLevel = Math.min(dupeLevel, MAX_DUPE);
    const isMax = cappedLevel >= MAX_DUPE;
    dupeDetailHtml = `
      <div class="pd-dupe-info">
        <span class="pd-dupe-count">取得回数: ${dupeCount}</span>
        <span class="pd-dupe-level ${isMax ? 'max' : ''}">
          ${isMax ? '凸MAX' : dupeLevel > 0 ? '凸' + dupeLevel : '凸なし'}
        </span>
      </div>
      ${renderDupeDisplay(dupeLevel, 3, "lg")}
      <div class="pd-dupe-bar">
        <div class="pd-dupe-fill" style="width:${(cappedLevel / MAX_DUPE) * 100}%"></div>
      </div>`;
  } else if (player.rarity === 2) {
    // ★2: 取得回数のみ
    dupeDetailHtml = `
      <div class="pd-dupe-info">
        <span class="pd-dupe-count">取得回数: ${dupeCount}</span>
      </div>`;
  }
  // ★1: 凸情報なし

  const container = document.getElementById("player-detail-container");
  container.innerHTML = `
    ${imgHtml}
    <div class="pd-stars">${starStr}</div>
    <div class="pd-name">${player.name}</div>
    <div class="pd-country">${player.country}</div>
    <div class="pd-pos ${posGroup}">${player.position}</div>
    <div class="pd-rate">排出率: ${player.rate}%</div>
    ${dupeDetailHtml}
    <button class="btn btn-close" onclick="closePlayerDetail()">閉じる</button>
  `;

  document.getElementById("player-detail-overlay").style.display = "flex";
}

function closePlayerDetail() {
  document.getElementById("player-detail-overlay").style.display = "none";
}

// === Custom Confirm Modal ===
function showConfirm(title, bodyHtml, icon = "📊") {
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

// === Simulator (確率検証) ===
async function runSimulation(count) {
  if (count < 1 || count > 1000000 || isNaN(count)) {
    alert("1\u301C1,000,000の範囲で入力してください");
    return;
  }

  const gbCost = (count * 300).toLocaleString();
  const yenCost = "\u00A5" + Math.ceil((count * 300) / 1.1).toLocaleString();

  const bodyHtml = `
    <div class="confirm-detail">
      <span class="confirm-detail-label">シミュレーション回数</span>
      <span class="confirm-detail-value accent">${count.toLocaleString()}連</span>
    </div>
    <div class="confirm-detail">
      <span class="confirm-detail-label">消費GB換算</span>
      <span class="confirm-detail-value">${gbCost} GB</span>
    </div>
    <div class="confirm-detail">
      <span class="confirm-detail-label">課金換算</span>
      <span class="confirm-detail-value yen">${yenCost}</span>
    </div>
  `;

  const confirmed = await showConfirm(
    `${count.toLocaleString()}連 シミュレーション`,
    bodyHtml,
    "🎰"
  );
  if (!confirmed) return;

  soundManager.init();
  soundManager.click();

  const bannerType = document.getElementById("sim-banner").value;
  const config = GACHA_CONFIG[bannerType];
  const results = { star3: 0, star2: 0, star1: 0 };
  const playerCounts = {};

  // Run simulation
  for (let i = 0; i < count; i++) {
    const pull = pullOne(config);
    results[`star${pull.rarity}`]++;
    playerCounts[pull.player.name] = (playerCounts[pull.player.name] || 0) + 1;
  }

  // Display results
  const simResults = document.getElementById("sim-results");
  simResults.style.display = "block";

  const total = count;
  const pct3 = ((results.star3 / total) * 100).toFixed(2);
  const pct2 = ((results.star2 / total) * 100).toFixed(2);
  const pct1 = ((results.star1 / total) * 100).toFixed(2);
  const exp3 = config.rates.star3.toFixed(2);
  const exp2 = config.rates.star2.toFixed(2);
  const exp1 = config.rates.star1.toFixed(2);

  document.getElementById("sim-summary").innerHTML = `
    <div class="sim-stat star3">
      <div class="label">\u2605 3</div>
      <div class="value">${results.star3}</div>
      <div class="sub">${pct3}% (期待値: ${exp3}%)</div>
    </div>
    <div class="sim-stat star2">
      <div class="label">\u2605 2</div>
      <div class="value">${results.star2}</div>
      <div class="sub">${pct2}% (期待値: ${exp2}%)</div>
    </div>
    <div class="sim-stat star1">
      <div class="label">\u2605 1</div>
      <div class="value">${results.star1}</div>
      <div class="sub">${pct1}% (期待値: ${exp1}%)</div>
    </div>
  `;

  // Bar chart
  const maxPct = Math.max(parseFloat(pct3), parseFloat(pct2), parseFloat(pct1), parseFloat(exp3), parseFloat(exp2), parseFloat(exp1));
  const scale = 100 / Math.max(maxPct * 1.2, 1);

  document.getElementById("sim-chart").innerHTML = `
    <div class="sim-bar-container">
      <div class="sim-bar-row">
        <div class="sim-bar-label">\u2605 3 実測</div>
        <div class="sim-bar-track"><div class="sim-bar-fill star3" style="width:${pct3 * scale}%">${pct3}%</div></div>
        <div class="sim-bar-expected">期待 ${exp3}%</div>
      </div>
      <div class="sim-bar-row">
        <div class="sim-bar-label">\u2605 2 実測</div>
        <div class="sim-bar-track"><div class="sim-bar-fill star2" style="width:${pct2 * scale}%">${pct2}%</div></div>
        <div class="sim-bar-expected">期待 ${exp2}%</div>
      </div>
      <div class="sim-bar-row">
        <div class="sim-bar-label">\u2605 1 実測</div>
        <div class="sim-bar-track"><div class="sim-bar-fill star1" style="width:${pct1 * scale}%">${pct1}%</div></div>
        <div class="sim-bar-expected">期待 ${exp1}%</div>
      </div>
    </div>
  `;

  // レアリティ別 全選手の出現回数
  function buildPlayerTable(starPlayers, rarity, label, colorClass) {
    const rows = starPlayers.map(p => {
      const cnt = playerCounts[p.name] || 0;
      const pct = ((cnt / total) * 100).toFixed(3);
      const flag = getFlag(p.country);
      const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[p.name] : null;
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;" onerror="this.outerHTML='${flag}'">`
        : flag;
      const barWidth = Math.min((cnt / Math.max(...starPlayers.map(sp => playerCounts[sp.name] || 1))) * 100, 100);
      return `<tr class="${cnt === 0 ? 'sim-zero' : ''}">
        <td>${imgHtml}</td>
        <td><span class="col-pos ${getPosGroup(p.position)}" style="font-size:9px;">${p.position}</span></td>
        <td>${p.name}</td>
        <td style="font-weight:700;">${cnt}</td>
        <td>${pct}%</td>
        <td style="width:80px;"><div class="sim-mini-bar"><div class="sim-mini-fill ${colorClass}" style="width:${barWidth}%"></div></div></td>
      </tr>`;
    }).join("");

    const totalStar = starPlayers.reduce((sum, p) => sum + (playerCounts[p.name] || 0), 0);
    const got = starPlayers.filter(p => (playerCounts[p.name] || 0) > 0).length;

    return `
      <div class="sim-rarity-section">
        <h4 class="sim-rarity-title ${colorClass}">${label} <span style="font-size:12px; font-weight:400;">(${got}/${starPlayers.length}種 獲得 / 合計${totalStar}枚)</span></h4>
        <table class="sim-player-table">
          <thead><tr><th></th><th></th><th>選手名</th><th>枚数</th><th>確率</th><th>分布</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  document.getElementById("sim-detail").innerHTML = `
    ${buildPlayerTable(PLAYERS.star3, 3, "\u2605\u2605\u2605 選手別結果", "star3")}
    ${buildPlayerTable(PLAYERS.star2, 2, "\u2605\u2605 選手別結果", "star2")}
    ${buildPlayerTable(PLAYERS.star1, 1, "\u2605 選手別結果", "star1")}
    <div style="margin-top:16px; font-size:11px; color:var(--text-muted);">
      総回数: ${total.toLocaleString()}連 / GB消費: ${(total * 300).toLocaleString()} GB
      / 課金換算: 約\u00A5${Math.ceil((total * 300) / 1.1).toLocaleString()}
    </div>
  `;
}

// === History & Rates Display ===

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

function renderRates() {
  const content = document.getElementById("rates-content");
  const config = GACHA_CONFIG[state.banner];
  const r = config.rates;
  const isPickup = state.banner === "pickup";
  const puCount = isPickup && typeof PICKUP_STAR3 !== "undefined" ? PICKUP_STAR3.length : 0;
  const s3c = PLAYERS.star3.length + puCount;
  const s2c = PLAYERS.star2.length, s1c = PLAYERS.star1.length;

  let html = `
    <div style="font-size:13px; font-weight:700; margin-bottom:8px; text-align:center;">
      提供割合 一覧${isPickup ? '（ピックアップ）' : ''}
    </div>
    <div style="display:flex; justify-content:center; gap:16px; margin-bottom:12px; font-size:13px;">
      <span class="color-star3">\u2605 3 \u2014 ${r.star3.toFixed ? r.star3.toFixed(3) : r.star3 + '.000'}%</span>
      <span class="color-star2">\u2605 2 \u2014 ${r.star2.toFixed ? r.star2.toFixed(3) : r.star2 + '.000'}%</span>
      <span class="color-star1">\u2605 1 \u2014 ${r.star1.toFixed ? r.star1.toFixed(3) : r.star1 + '.000'}%</span>
    </div>
    <table class="rates-table">
      <thead><tr><th>レアリティ</th><th>排出率</th><th>対象人数</th><th>個別確率</th></tr></thead>
      <tbody>`;

  if (isPickup) {
    html += `
        <tr style="color:#ffd700;"><td>\u2605\u2605\u2605 PU</td><td>${config.pickupRate.toFixed(3)}%</td><td>${puCount}人</td><td>1.000%</td></tr>
        <tr><td class="color-star3">\u2605\u2605\u2605 通常</td><td>0.972%</td><td>${PLAYERS.star3.length}人</td><td>0.027%</td></tr>`;
  } else {
    html += `
        <tr><td class="color-star3">\u2605\u2605\u2605</td><td>${r.star3}.000%</td><td>${PLAYERS.star3.length}人</td><td>0.138%</td></tr>`;
  }
  html += `
        <tr><td class="color-star2">\u2605\u2605</td><td>${isPickup ? r.star2.toFixed(3) : r.star2 + '.000'}%</td><td>${s2c}人</td><td>0.208%</td></tr>
        <tr><td class="color-star1">\u2605</td><td>${isPickup ? r.star1.toFixed(3) : r.star1 + '.000'}%</td><td>${s1c}人</td><td>1.517%</td></tr>
      </tbody>
    </table>`;

  // ピックアップ★3選手一覧
  if (isPickup && puCount > 0) {
    html += `<div style="margin-top:16px;"><h4 style="font-size:13px; margin-bottom:8px; color:#ffd700;">\u2605 3 ピックアップ選手</h4>`;
    html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
    PICKUP_STAR3.forEach(p => {
      const posG = getPosGroup(p.position);
      html += `<tr style="color:#ffd700;"><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  // ★3通常選手一覧
  html += `<div style="margin-top:16px;"><h4 class="color-star3" style="font-size:13px; margin-bottom:8px;">\u2605 3 ${isPickup ? '通常' : ''}選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star3.forEach(p => {
    const posG = getPosGroup(p.position);
    const rate = isPickup ? '0.027' : p.rate;
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  // ★2選手一覧
  html += `<div style="margin-top:16px;"><h4 class="color-star2" style="font-size:13px; margin-bottom:8px;">\u2605 2 選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star2.forEach(p => {
    const posG = getPosGroup(p.position);
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  // ★1選手一覧
  html += `<div style="margin-top:16px;"><h4 class="color-star1" style="font-size:13px; margin-bottom:8px;">\u2605 1 選手一覧</h4>`;
  html += `<table class="rates-table"><thead><tr><th></th><th>ポジション</th><th>選手名</th><th>確率</th></tr></thead><tbody>`;
  PLAYERS.star1.forEach(p => {
    const posG = getPosGroup(p.position);
    html += `<tr><td>${getFlag(p.country)}</td><td><span class="col-pos ${posG}" style="font-size:10px;">${p.position}</span></td><td>${p.name}</td><td>${p.rate}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  html += `
    <div style="margin-top:12px; font-size:11px; color:var(--text-muted);">
      ※ 10連スカウトでは\u2605 2以上のSP選手が最低1枚確定<br>
      ※ メダルは1回のスカウトにつき1枚獲得（最大1000枚）/ 200枚で★3選手1名と交換<br>
      ※ 排出率はゲーム内「提供割合 一覧」からの転記データです
    </div>`;

  content.innerHTML = html;
}

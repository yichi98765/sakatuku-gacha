// === Simulator (確率検証) ===

async function runSimulation(count) {
  if (count < 1 || count > 1000000 || isNaN(count)) {
    alert("1\u301C1,000,000の範囲で入力してください");
    return;
  }

  const gbCost = (count * 300).toLocaleString();
  const yenCost = formatYen(count * 300);

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
    "\u{1F3B0}"
  );
  if (!confirmed) return;

  soundManager.init();
  soundManager.click();

  const bannerType = document.getElementById("sim-banner").value;
  const config = GACHA_CONFIG[bannerType];
  const results = { star3: 0, star2: 0, star1: 0 };
  const playerCounts = {};

  for (let i = 0; i < count; i++) {
    const pull = pullOne(config);
    results[`star${pull.rarity}`]++;
    playerCounts[pull.player.name] = (playerCounts[pull.player.name] || 0) + 1;
  }

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

  // Player detail tables
  function buildPlayerTable(starPlayers, rarity, label, colorClass) {
    const rows = starPlayers.map(p => {
      const cnt = playerCounts[p.name] || 0;
      const pct = ((cnt / total) * 100).toFixed(3);
      const flag = getFlag(p.country);
      const imgHtml = getPlayerImageHtml(p.name, flag, "sim");
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
      / 課金換算: 約${formatYen(total * 300)}
    </div>
  `;
}

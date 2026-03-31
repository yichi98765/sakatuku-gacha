// === Medal Exchange ===

function openExchange() {
  soundManager.init();
  soundManager.click();
  const overlay = document.getElementById("exchange-overlay");
  const container = document.getElementById("exchange-players");
  document.getElementById("exchange-medal-display").textContent = state.medals;

  container.innerHTML = "";
  // ピックアップ★3 + 通常★3を表示
  const allStar3 = (typeof PICKUP_STAR3 !== "undefined" ? [...PICKUP_STAR3] : []).concat(PLAYERS.star3);
  allStar3.forEach(player => {
    const canExchange = state.medals >= 200;
    const flag = getFlag(player.country);
    const imgHtml = getPlayerImageHtml(player.name, flag, "exchange");
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

  openOverlay(overlay);
}

function exchangePlayer(playerName) {
  if (state.medals < 200) return;
  const allStar3 = (typeof PICKUP_STAR3 !== "undefined" ? [...PICKUP_STAR3] : []).concat(PLAYERS.star3);
  const player = allStar3.find(p => p.name === playerName);
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
  closeOverlay(document.getElementById("exchange-overlay"));
}

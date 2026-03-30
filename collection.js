// === Collection (図鑑) & Player Detail ===

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
    const imgHtml = getPlayerImageHtml(p.name, flag, "col");

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
  if (!owned) return;

  const dupeCount = state.dupes[player.name] || 0;
  const dupeLevel = dupeCount > 1 ? dupeCount - 1 : 0;
  const flag = getFlag(player.country);
  const starStr = "\u2605".repeat(player.rarity);
  const posGroup = getPosGroup(player.position);
  const imgHtml = getPlayerImageHtml(player.name, flag, "pd");

  let dupeDetailHtml = "";
  if (player.rarity === 3) {
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
    dupeDetailHtml = `
      <div class="pd-dupe-info">
        <span class="pd-dupe-count">取得回数: ${dupeCount}</span>
      </div>`;
  }

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

  openOverlay(document.getElementById("player-detail-overlay"));
}

function closePlayerDetail() {
  closeOverlay(document.getElementById("player-detail-overlay"));
}

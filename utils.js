// === Shared Utilities ===

// --- Overlay open/close helpers (hides footer when overlay is open) ---
function openOverlay(el) {
  el.style.display = "flex";
  document.body.classList.add("overlay-open");
}
function closeOverlay(el) {
  el.style.display = "none";
  // Only remove class if no other overlays are visible
  const anyOpen = document.querySelectorAll('.overlay[style*="flex"]');
  if (anyOpen.length === 0) {
    document.body.classList.remove("overlay-open");
  }
}

// --- Player image HTML helper (eliminates 5x duplication) ---
function getPlayerImageHtml(playerName, flag, size = "card") {
  const imgUrl = (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[playerName] : null;

  const sizeConfig = {
    card:     { cls: "card-img", flagCls: "card-flag", flagStyle: "" },
    col:      { cls: "col-img", flagCls: "col-flag", flagStyle: "" },
    pd:       { cls: "pd-img", flagCls: "pd-flag", flagStyle: "" },
    exchange: { cls: "exchange-img", flagCls: "", flagStyle: 'style="font-size:28px;"' },
    sim:      { cls: "", flagCls: "", flagStyle: "" },
  };

  const cfg = sizeConfig[size] || sizeConfig.card;

  if (size === "sim") {
    if (imgUrl) {
      return `<img src="${imgUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;" onerror="this.outerHTML='${flag}'">`;
    }
    return flag;
  }

  // ★3カード用: 背景画像として返す
  if (size === "card-bg") {
    if (imgUrl) {
      return `<div class="card-bg-img"><img src="${imgUrl}" alt="${playerName}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`;
    }
    return "";
  }

  if (imgUrl) {
    return `<div class="${cfg.cls}"><img src="${imgUrl}" alt="${playerName}" loading="lazy" onerror="this.parentElement.innerHTML='${flag}'"></div>`;
  }

  if (cfg.flagCls) {
    return `<div class="${cfg.flagCls}">${flag}</div>`;
  }
  return `<div ${cfg.flagStyle}>${flag}</div>`;
}

function getPlayerImageUrl(playerName) {
  return (typeof PLAYER_IMAGES !== 'undefined') ? PLAYER_IMAGES[playerName] : null;
}

// --- Format numbers ---
function formatNumber(n) {
  return n.toLocaleString();
}

function formatYen(gb) {
  return "¥" + Math.ceil(gb / 1.1).toLocaleString();
}

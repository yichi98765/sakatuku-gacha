// === サカつく2026 ガチャシミュレーター — Main Entry Point ===
// All logic is split across modules loaded before this file:
//   utils.js     — shared helpers (getPlayerImageHtml, formatYen, etc.)
//   state.js     — state management, localStorage
//   ui.js        — theme, sound, navigation, banner, charge, confirm modal
//   gacha.js     — pull logic, reset
//   results.js   — result display, cards, animation, star3 effects
//   collection.js — 図鑑, player detail
//   exchange.js  — medal exchange
//   history.js   — history stats, rates display
//   simulator.js — 確率検証 mode

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initBannerTabs();
  updateUI();
  renderRates();
  soundManager.init();
  applyTheme();
  applySoundIcon();
});

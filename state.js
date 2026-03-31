// === State Management ===

const GACHA_CONFIG = {
  normal: {
    title: "SP選手スカウト",
    desc: "★3 SP選手を獲得しよう！",
    rates: { star3: 5, star2: 10, star1: 85 },
    pickupRate: 0,
  },
  pickup: {
    title: "ピックアップスカウト",
    desc: "ピックアップ★3選手 排出率UP！",
    rates: { star3: 4.972, star2: 9.984, star1: 85.044 },
    pickupRate: 4.000,  // ピックアップ4名合計
  }
};

const MAX_DUPE = 6; // 最大凸数（凸1〜凸6）

let state = {
  banner: "normal",
  gb: 50000,
  medals: 0,
  totalPulls: 0,
  totalGBSpent: 0,
  history: [],
  dupes: {},
  stats: { star3: 0, star2: 0, star1: 0 },
  theme: "dark",
  soundEnabled: true,
};

let animationTimeouts = [];
let isAnimating = false;

const STORAGE_KEY = "sakatuku2026_gacha_state";

function saveState() {
  const toSave = {
    banner: state.banner,
    gb: state.gb,
    medals: state.medals,
    totalPulls: state.totalPulls,
    totalGBSpent: state.totalGBSpent,
    history: state.history.slice(0, 500),
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

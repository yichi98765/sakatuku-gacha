// === Gacha Pull Logic ===

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
    state.medals = Math.min(state.medals + 1, 1000);
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
  const isPickup = state.banner === "pickup";

  if (minRarity >= 3) {
    rarity = 3;
  } else if (minRarity >= 2) {
    rarity = roll < config.rates.star3 ? 3 : 2;
  } else {
    if (roll < config.rates.star3) rarity = 3;
    else if (roll < config.rates.star3 + config.rates.star2) rarity = 2;
    else rarity = 1;
  }

  let player;
  if (rarity === 3 && isPickup) {
    // ピックアップ: ★3内でピックアップ枠(4.000%) vs 通常枠(0.972%)を振り分け
    const star3Roll = Math.random() * config.rates.star3;
    if (star3Roll < config.pickupRate) {
      // ピックアップ選手から均等抽選
      player = PICKUP_STAR3[Math.floor(Math.random() * PICKUP_STAR3.length)];
    } else {
      // 通常★3から均等抽選
      player = PLAYERS.star3[Math.floor(Math.random() * PLAYERS.star3.length)];
    }
  } else {
    const pool = rarity === 3 ? PLAYERS.star3 : rarity === 2 ? PLAYERS.star2 : PLAYERS.star1;
    player = pool[Math.floor(Math.random() * pool.length)];
  }

  return { rarity, player, isNew: false, dupeCount: 0 };
}

// --- Reset ---
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

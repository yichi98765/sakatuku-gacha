// === Result Display: Cards, Animation, Star3 Effects ===

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
    const totalCount = dupeCount + 1;
    const cls = size === "lg" ? "dupe-text lg" : "dupe-text";
    return `<div class="${cls}">\u00D7${totalCount}回</div>`;
  }
  return "";
}

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

  document.getElementById("btn-skip").style.display = "inline-block";
  document.getElementById("btn-close-result").style.display = "none";

  if (hasStar3) {
    cinematic.style.display = "block";
    cinematic.classList.remove("fade-out");
    const animEls = cinematic.querySelectorAll(".manager-figure, .trophy-area, .trophy-glow, .trophy-rays, .cinematic-text, .led-strip, .bench-obj, .corridor-scene");
    animEls.forEach(el => { el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; });
    const managerSvg = cinematic.querySelector(".manager-figure");
    if (managerSvg) { managerSvg.style.animation = "none"; managerSvg.offsetHeight; managerSvg.style.animation = ""; }

    overlay.style.display = "flex";
    soundManager.star3Flash();

    const t1 = setTimeout(() => { soundManager.star3Reveal(); }, 1200);
    animationTimeouts.push(t1);

    const t2 = setTimeout(() => { cinematic.classList.add("fade-out"); }, 3000);
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

  const totalTime = baseDelay + results.length * 300 + 500;
  const closeT = setTimeout(() => {
    document.getElementById("btn-skip").style.display = "none";
    document.getElementById("btn-close-result").style.display = "inline-block";
    isAnimating = false;
  }, totalTime);
  animationTimeouts.push(closeT);
}

function createCard(result, index, hasStar3) {
  const card = document.createElement("div");
  card.className = "card";
  if (result.rarity === 3) card.classList.add("has-star3");

  const starStr = "\u2605".repeat(result.rarity);
  const p = result.player;
  const flag = getFlag(p.country);
  const posGroup = getPosGroup(p.position);

  let dupeHtml = "";
  if (result.rarity === 3 && result.dupeCount > 1) {
    dupeHtml = renderDupeDisplay(result.dupeCount - 1, 3);
  } else if (result.rarity === 2 && result.dupeCount > 1) {
    dupeHtml = renderDupeDisplay(result.dupeCount - 1, 2);
  }

  if (result.rarity >= 2) {
    // ★3, ★2: 画像をカード背景に全面表示
    const bgHtml = getPlayerImageHtml(p.name, flag, "card-bg");
    const smallImgHtml = bgHtml ? "" : getPlayerImageHtml(p.name, flag, "card");
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back star${result.rarity}">
          ${result.isNew ? '<div class="card-new">NEW</div>' : ''}
          ${bgHtml}
          <div class="card-info-overlay">
            ${smallImgHtml}
            <div class="card-stars">${starStr}</div>
            <div class="card-position ${posGroup}">${p.position}</div>
            <div class="card-name">${p.name}</div>
            <div class="card-country">${p.country}</div>
            ${dupeHtml}
          </div>
        </div>
      </div>
    `;
  } else {
    // ★1: 従来通り
    const imgHtml = getPlayerImageHtml(p.name, flag, "card");
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
  }

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

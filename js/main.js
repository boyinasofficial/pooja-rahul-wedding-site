/* ============================================================
   Core: language, gate, images, parallax, reveals, events,
   knot, countdown, music, petals
   ============================================================ */
(function () {
  const CFG = window.WEDDING_CONFIG;
  const T = window.I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const IMG = "assets/images/";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const portrait = () => window.innerWidth / window.innerHeight < 1;

  /* ---------------- LANGUAGE ---------------- */
  let lang = store.get("wedding.lang") || CFG.DEFAULT_LANG || "te";
  window.t = (k) => (T[lang] && T[lang][k] != null ? T[lang][k] : (T.en[k] || ""));
  window.currentLang = () => lang;

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    store.set("wedding.lang", l);
    // Wording comes only from i18n.js (our own trusted text), so innerHTML is safe here.
    $$("[data-i18n]").forEach(n => { n.innerHTML = window.t(n.dataset.i18n); });
    $$("[data-i18n-ph]").forEach(n => { n.placeholder = window.t(n.dataset.i18nPh); });
    $$(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
    renderEvents();
    document.dispatchEvent(new CustomEvent("wedding:lang", { detail: l }));
  }

  /* ---------------- IMAGES ---------------- */
  function tryLoad(urls, ok) {
    const [u, ...rest] = urls;
    if (!u) return;
    const im = new Image();
    im.onload = () => ok(u);
    im.onerror = () => tryLoad(rest, ok);
    im.src = u;
  }
  function candidates(name) {
    const b = IMG + name;
    const list = portrait() ? [b + "_mobile", b, b + "_desktop"] : [b + "_desktop", b, b + "_mobile"];
    return list.flatMap(x => [x + ".webp", x + ".png", x + ".jpg"]);
  }
  // Sections get a separate background layer so it can drift (parallax + slow zoom)
  function loadSlots(root = document) {
    $$("[data-img]", root).forEach(n => tryLoad(candidates(n.dataset.img), (u) => {
      if (n.tagName === "SECTION") {
        let layer = n.querySelector(":scope > .bg-layer");
        if (!layer) {
          layer = document.createElement("div");
          layer.className = "bg-layer";
          layer.innerHTML = '<div class="bg-img"></div>';
          n.prepend(layer);
        }
        layer.firstChild.style.backgroundImage = `url("${u}")`;
      } else {
        n.style.backgroundImage = `url("${u}")`;
      }
      n.classList.add("has-img");
    }));
  }
  tryLoad([IMG + "16_parchment-texture.webp", IMG + "16_parchment-texture.png"], (u) => {
    document.body.style.backgroundImage = `url("${u}")`;
    document.body.style.backgroundSize = "420px";
  });

  /* ---------------- PARALLAX (background layers) ---------------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = innerHeight;
      if (!reduced) $$(".bg-layer").forEach(l => {
        const r = l.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
        l.firstChild.style.translate = `0 ${(p * -5).toFixed(2)}%`;
      });
      knotProgress();
    });
  }

  /* ---------------- GATE (temple doors) ---------------- */
  // Door positions measured on the generated artwork (pixels of each image)
  const GATE = {
    mobile:  { img: "01_entrance-doors_mobile.webp",  W: 728,  H: 1028, x0: 150, x1: 580, y0: 197, y1: 874, seam: 365,
               trunks: { x: 127, y: 613, w: 477, h: 188 } },
    desktop: { img: "01_entrance-doors_desktop.webp", W: 1376, H: 768,  x0: 520, x1: 855, y0: 212, y1: 670, seam: 687 }
  };
  let gateKey = null;
  function layoutGate() {
    const key = portrait() ? "mobile" : "desktop";
    const g = GATE[key];
    const st = $("#gateStage");
    const vw = innerWidth, vh = innerHeight;
    const scale = Math.max(vw / g.W, vh / g.H);
    const w = g.W * scale, h = g.H * scale;
    Object.assign(st.style, { width: w + "px", height: h + "px", left: (vw - w) / 2 + "px", top: (vh - h) / 2 + "px" });
    const pct = (v, t) => (v / t * 100) + "%";
    const box = { left: pct(g.x0, g.W), top: pct(g.y0, g.H), width: pct(g.x1 - g.x0, g.W), height: pct(g.y1 - g.y0, g.H) };
    Object.assign($("#gateLeaves").style, box);
    Object.assign($("#gateInner").style, box);
    $(".gleaf-l").style.width = pct(g.seam - g.x0, g.x1 - g.x0);
    $(".gleaf-r").style.width = pct(g.x1 - g.seam, g.x1 - g.x0);
    st.style.transformOrigin = `${(g.x0 + g.x1) / 2 / g.W * 100}% ${(g.y0 + g.y1) / 2 / g.H * 100}%`;
    if (key !== gateKey) {
      gateKey = key;
      $("#gateBg").src = IMG + g.img;
      $("#leafL").src = IMG + "gate-leaf-l_" + key + ".webp";
      $("#leafR").src = IMG + "gate-leaf-r_" + key + ".webp";
      const tr = $("#gateTrunks");
      if (g.trunks) {
        tr.src = IMG + "gate-trunks_mobile.webp"; tr.hidden = false;
        Object.assign(tr.style, { left: pct(g.trunks.x, g.W), top: pct(g.trunks.y, g.H), width: pct(g.trunks.w, g.W), height: pct(g.trunks.h, g.H) });
      } else tr.hidden = true;
    }
  }

  /* ---------------- EVENTS ---------------- */
  // Door frame artwork: 690×1213, open doorway at x151–540, y375–1141
  const HOLE = { l: 151 / 690 * 100, t: 375 / 1213 * 100, w: 389 / 690 * 100, h: 766 / 1213 * 100 };
  const EVENTS = [
    { key: "vindu", map: "eluru", scene: "08_scene-vindu" },
    { key: "muh", map: "eluru", scene: "09_scene-muhurtham" },
    { key: "vrat", map: null, scene: "10_scene-vratham" },
    { key: "rec", map: "vizag", scene: "11_scene-reception" }
  ];
  const openEvents = new Set();
  const evIO = new IntersectionObserver((ents) => ents.forEach(e => {
    if (e.isIntersecting && document.body.classList.contains("entered")) {
      const el = e.target;
      setTimeout(() => openEvent(el), 450);
      evIO.unobserve(el);
    }
  }), { threshold: .55 });
  function openEvent(el) {
    if (el.classList.contains("open")) return;
    el.classList.add("open");
    openEvents.add(el.dataset.key);
  }
  function renderEvents() {
    const list = $("#eventList"); if (!list) return;
    list.textContent = "";
    EVENTS.forEach((ev, i) => {
      const k = "ev." + ev.key + ".";
      const time = window.t(k + "time");
      const panch = ev.key === "muh" ? `<p class="p">${window.t(k + "panch")}</p>` : "";
      const map = ev.map ? `<a class="ev-map" href="${CFG.MAPS[ev.map]}" target="_blank" rel="noopener">📍 ${window.t("ev.map")}</a>` : "";
      const wrap = document.createElement("article");
      wrap.className = "ev reveal" + (openEvents.has(ev.key) ? " open" : "");
      wrap.dataset.key = ev.key;
      wrap.innerHTML = `
        <div class="ev-frame">
          <div class="ev-hole" style="left:${HOLE.l}%;top:${HOLE.t}%;width:${HOLE.w}%;height:${HOLE.h}%">
            <div class="ev-scene" style="background-image:url('${IMG + ev.scene}.webp')"></div>
            <div class="ev-glow"></div>
            <div class="ev-leaves"><div class="eleaf l"></div><div class="eleaf r"></div></div>
          </div>
          <img class="ev-frame-img" src="${IMG}07_door-frame.webp" alt="" loading="lazy">
          <button type="button" class="ev-tap">${window.t("ev.tap")}</button>
        </div>
        <div class="ev-card">
          <span class="ev-num">${String(i + 1).padStart(2, "0")}</span>
          <h3>${window.t(k + "name")}</h3>
          <p class="d">${window.t(k + "date")}</p>
          ${time ? `<p class="t">${time}</p>` : ""}
          ${panch}
          <p class="v">${window.t(k + "venue")}</p>
          ${map}
        </div>`;
      wrap.querySelector(".ev-tap").addEventListener("click", () => openEvent(wrap));
      wrap.querySelector(".ev-frame").addEventListener("click", () => openEvent(wrap));
      list.appendChild(wrap);
      if (!openEvents.has(ev.key)) evIO.observe(wrap);
    });
    observeReveals(list);
  }

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const revIO = new IntersectionObserver((ents) => ents.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); }
  }), { threshold: .15 });
  function observeReveals(root = document) { $$(".reveal:not(.in), .scroll-head:not(.in), .leaf:not(.in)", root).forEach(n => revIO.observe(n)); }

  /* ---------------- BRAHMAMUDI (scroll-driven) ---------------- */
  function knotProgress() {
    const st = $("#knotStage"); if (!st) return;
    const r = st.getBoundingClientRect();
    const p = reduced ? 1 : Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * .55)));
    st.style.setProperty("--p", p.toFixed(3));
    st.classList.toggle("tied", p > .98);
  }

  /* ---------------- COUNTDOWN ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  function setNum(id, v) {
    const n = $(id); const s = String(v);
    if (n.textContent === s) return;
    n.textContent = s;
    n.classList.remove("flip"); void n.offsetWidth; n.classList.add("flip");
  }
  function tick() {
    const diff = new Date(CFG.MUHURTHAM_ISO).getTime() - Date.now();
    if (diff <= 0) { $("#cdGrid").hidden = true; $("#cdDone").hidden = false; return; }
    const s = Math.floor(diff / 1000);
    setNum("#cdD", Math.floor(s / 86400));
    setNum("#cdH", pad(Math.floor(s % 86400 / 3600)));
    setNum("#cdM", pad(Math.floor(s % 3600 / 60)));
    setNum("#cdS", pad(s % 60));
  }

  /* ---------------- MUSIC ---------------- */
  const audio = $("#bgm"), mbtn = $("#musicToggle");
  let musicOk = true;
  audio.addEventListener("error", () => { musicOk = false; mbtn.style.display = "none"; });
  function playMusic() {
    if (!musicOk) return;
    if (!audio.src) audio.src = CFG.MUSIC_SRC;
    audio.volume = 0.55;
    audio.play().then(() => mbtn.classList.add("playing")).catch(() => {});
  }
  mbtn.addEventListener("click", () => {
    if (audio.paused) playMusic(); else { audio.pause(); mbtn.classList.remove("playing"); }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) { audio.pause(); audio.dataset.resume = "1"; }
    else if (!document.hidden && audio.dataset.resume) { delete audio.dataset.resume; playMusic(); }
  });

  /* ---------------- PETALS / AKSHINTALU ---------------- */
  const cv = $("#petals"), cx = cv.getContext("2d");
  let parts = [], ambient = false;
  function size() { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  size();
  const COLORS = ["#b3263a", "#e35d6a", "#f2a0a8", "#f2c14e", "#ffffff"];
  function spawn(kind, x, y) {
    parts.push({
      kind, x: x ?? Math.random() * innerWidth, y: y ?? -20,
      vx: (Math.random() - .5) * (kind === "rice" ? 3 : 1), vy: kind === "rice" ? 2 + Math.random() * 3 : .6 + Math.random() * 1.2,
      r: kind === "rice" ? 2.2 : 4 + Math.random() * 4, a: Math.random() * 6.28, va: (Math.random() - .5) * .08,
      c: kind === "rice" ? (Math.random() < .8 ? "#f2c14e" : "#e3a82b") : COLORS[Math.floor(Math.random() * COLORS.length)], life: 0
    });
  }
  window.burstPetals = (n = 30) => { if (!reduced) for (let i = 0; i < n; i++) spawn("petal", Math.random() * innerWidth, -20 - Math.random() * 200); };
  window.showerAkshintalu = (n = 160) => { if (!reduced) for (let i = 0; i < n; i++) spawn("rice", innerWidth * (.2 + Math.random() * .6), -10 - Math.random() * 300); };
  function frame() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    if (ambient && !reduced && parts.length < 10 && Math.random() < .02) spawn("petal");
    parts = parts.filter(p => p.y < innerHeight + 30);
    parts.forEach(p => {
      p.life++; p.x += p.vx + Math.sin((p.life + p.r * 10) / 40) * .4; p.y += p.vy; p.a += p.va;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c;
      cx.beginPath();
      if (p.kind === "rice") cx.ellipse(0, 0, p.r, p.r * 2.1, 0, 0, 6.28);
      else { cx.globalAlpha = .85; cx.ellipse(0, 0, p.r, p.r * .6, 0, 0, 6.28); }
      cx.fill(); cx.restore();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------------- ENTER ---------------- */
  function enter() {
    const gate = $("#gate");
    if (gate.classList.contains("open")) return;
    gate.classList.add("open");          // UI fades, doors swing, light pours out
    playMusic();
    setTimeout(() => gate.classList.add("zoom"), 900);    // walk through the doorway
    setTimeout(() => gate.classList.add("flash"), 2500);  // golden light fills the screen
    setTimeout(() => {
      document.body.classList.remove("locked");
      document.body.classList.add("entered");
      scrollTo(0, 0);
      gate.classList.add("gone");
      ambient = true;
      window.burstPetals(36);
      window.dispatchEvent(new Event("wedding:entered"));
      $$(".ev").forEach(n => { evIO.unobserve(n); evIO.observe(n); });
    }, 3100);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(lang);
    layoutGate();
    loadSlots();
    observeReveals();
    $$(".lang-btn").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
    $("#langToggle").addEventListener("click", () => applyLang(lang === "te" ? "en" : "te"));
    $("#openGate").addEventListener("click", enter);
    $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
    addEventListener("scroll", onScroll, { passive: true });
    let rt;
    addEventListener("resize", () => { size(); clearTimeout(rt); rt = setTimeout(() => { layoutGate(); onScroll(); }, 120); });
    onScroll();
    tick(); setInterval(tick, 1000);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
  });
})();

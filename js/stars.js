/* ============================================================
   CHAPTER I · Karkataka (Cancer) & Simha (Leo)
   Aslesha (last nakshatra of Karkataka) meets Magha (first of Simha)
   ============================================================ */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);

  // Artistic star positions in a 1000×1000 sky
  const CANCER = {
    stars: { iota: [175, 270], gamma: [215, 360], delta: [238, 425], alpha: [300, 520], beta: [130, 500] },
    lines: [["iota", "gamma"], ["gamma", "delta"], ["delta", "alpha"], ["delta", "beta"]]
  };
  const LEO = {
    stars: {
      regulus: [600, 560], eta: [615, 470], algieba: [650, 400], zeta: [700, 345], mu: [668, 285], eps: [612, 300],
      zosma: [820, 390], denebola: [905, 450], chertan: [820, 470]
    },
    lines: [["regulus", "eta"], ["eta", "algieba"], ["algieba", "zeta"], ["zeta", "mu"], ["mu", "eps"],
            ["algieba", "zosma"], ["zosma", "denebola"], ["denebola", "chertan"], ["chertan", "regulus"], ["chertan", "zosma"]]
  };
  // Aslesha: the coiled serpent-head ring of stars beside Karkataka
  const ASLESHA = [[318, 572], [338, 556], [360, 566], [362, 590], [340, 602], [318, 592]];
  const ASLESHA_C = [340, 580];
  const MAGHA = LEO.stars.regulus;
  const MEET = [470, 760];

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function buildConst(group, data, bigKey) {
    data.lines.forEach(([a, b]) => {
      const [x1, y1] = data.stars[a], [x2, y2] = data.stars[b];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ln = el("line", { x1, y1, x2, y2 }, group);
      ln.style.setProperty("--len", len.toFixed(1));
    });
    Object.entries(data.stars).forEach(([k, [x, y]]) => {
      el("circle", { cx: x, cy: y, r: k === bigKey ? 9 : 5.5 }, group);
    });
  }

  function build() {
    // Phones: zoom into the constellations so they read larger
    if (window.matchMedia("(max-aspect-ratio: 3/4)").matches) $("sky").setAttribute("viewBox", "90 90 840 760");
    const dust = $("dust");
    for (let i = 0; i < 140; i++) {
      const c = el("circle", { cx: Math.random() * 1000, cy: Math.random() * 1000, r: (Math.random() * 1.6 + .3).toFixed(2), fill: "#fff" }, dust);
      c.setAttribute("opacity", (Math.random() * .6 + .2).toFixed(2));
      if (i % 3 === 0) { c.classList.add("tw"); c.style.animationDelay = (Math.random() * 3).toFixed(2) + "s"; }
    }
    buildConst($("cancer"), CANCER, "alpha");
    buildConst($("leo"), LEO, "regulus");

    const asl = $("aslesha");
    const ring = ASLESHA.map(p => p.join(",")).join(" ");
    el("polygon", { points: ring, class: "ring" }, asl);
    ASLESHA.forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 4.5 }, asl));
    const ag = el("circle", { cx: ASLESHA_C[0], cy: ASLESHA_C[1], r: 46, fill: "url(#gHalo)", class: "halo" }, asl);
    ag.style.opacity = 0;

    const mg = el("circle", { cx: MAGHA[0], cy: MAGHA[1], r: 52, fill: "url(#gHalo)", class: "halo" }, $("magha"));
    mg.style.opacity = 0;

    const rays = document.querySelector("#sun .rays");
    for (let i = 0; i < 12; i++) {
      el("line", { x1: 0, y1: -38, x2: 0, y2: -56, stroke: "#ffd56b", "stroke-width": 4, "stroke-linecap": "round", transform: `rotate(${i * 30})` }, rays);
    }
  }

  // ---------- timeline ----------
  let timers = [], raf = 0, played = false;
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function tween(dur, fn, done) {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      fn(ease(t));
      if (t < 1) raf = requestAnimationFrame(step); else if (done) done();
    };
    raf = requestAnimationFrame(step);
  }

  function drawLines(group, startMs) {
    group.querySelectorAll("line").forEach((ln, i) => {
      later(startMs + i * 260, () => {
        ln.style.transition = "stroke-dashoffset 1.1s ease";
        ln.style.strokeDashoffset = "0";
      });
    });
    group.querySelectorAll("circle").forEach((c, i) => {
      later(startMs + i * 180, () => { c.style.transition = "opacity .8s, transform .8s"; c.style.opacity = 1; });
    });
  }

  function show(id, ms) { later(ms, () => { const n = $(id); n.style.transition = "opacity 1.4s"; n.style.opacity = 1; }); }
  function line(i, ms) { later(ms, () => document.querySelectorAll("#stars .sl")[i].classList.add("on")); }

  function reset() {
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
    document.querySelectorAll("#stars .const line").forEach(l => { l.style.transition = "none"; l.style.strokeDashoffset = ""; });
    document.querySelectorAll("#stars .const circle, #stars .nak circle, #stars .ring").forEach(c => { c.style.transition = "none"; c.style.opacity = 0; });
    ["tCancer", "tLeo", "tAslesha", "tMagha", "moon", "sun", "orbA", "orbM", "deepam"].forEach(id => { $(id).style.transition = "none"; $(id).style.opacity = 0; });
    document.querySelector("#stars .rasi-border").style.opacity = 0;
    document.querySelectorAll("#stars .sl").forEach(s => s.classList.remove("on"));
    $("replayStars").classList.remove("on");
    $("moon").setAttribute("transform", "translate(120 120)");
    $("sun").setAttribute("transform", "translate(880 120)");
    $("deepam").setAttribute("transform", `translate(${MEET[0]} ${MEET[1]}) scale(.4)`);
  }

  function play() {
    reset();
    // 1. rasi boundary + constellations draw themselves
    later(200, () => { document.querySelector("#stars .rasi-border").style.opacity = 1; });
    drawLines($("cancer"), 400);
    show("tCancer", 1200);
    drawLines($("leo"), 1600);
    show("tLeo", 2600);

    // 2. Aslesha ring and Magha (Regulus) glow
    later(3600, () => {
      document.querySelectorAll("#aslesha circle:not(.halo)").forEach(c => { c.style.transition = "opacity .6s"; c.style.opacity = 1; });
      const r = document.querySelector("#aslesha .ring"); r.style.transition = "opacity 1s"; r.style.opacity = 1;
      const h = document.querySelector("#aslesha .halo"); h.style.transition = "opacity 1.2s"; h.style.opacity = 1;
    });
    show("tAslesha", 3900);
    line(0, 3900);
    later(4900, () => { const h = document.querySelector("#magha .halo"); h.style.transition = "opacity 1.2s"; h.style.opacity = 1; });
    show("tMagha", 5100);
    line(1, 5100);

    // 3. Moon (lord of Karkataka) and Sun (lord of Simha) rise and draw near
    later(6300, () => {
      line(2, 0);
      const m = $("moon"), s = $("sun");
      m.style.transition = s.style.transition = "opacity 1.2s"; m.style.opacity = 1; s.style.opacity = 1;
      tween(3200, (t) => {
        m.setAttribute("transform", `translate(${120 + t * 270} ${120 + t * 10})`);
        s.setAttribute("transform", `translate(${880 - t * 270} ${120 + t * 10})`);
      });
    });

    // 4. Two stars leave their rasis and become one flame
    later(9800, () => {
      const a = $("orbA"), b = $("orbM"), d = $("deepam");
      a.style.opacity = 1; b.style.opacity = 1;
      tween(2600, (t) => {
        const ax = ASLESHA_C[0] + (MEET[0] - ASLESHA_C[0]) * t, ay = ASLESHA_C[1] + (MEET[1] - ASLESHA_C[1]) * t - Math.sin(t * Math.PI) * 90;
        const bx = MAGHA[0] + (MEET[0] - MAGHA[0]) * t, by = MAGHA[1] + (MEET[1] - MAGHA[1]) * t - Math.sin(t * Math.PI) * 90;
        a.setAttribute("cx", ax); a.setAttribute("cy", ay); a.setAttribute("r", 10 + t * 8);
        b.setAttribute("cx", bx); b.setAttribute("cy", by); b.setAttribute("r", 10 + t * 8);
      }, () => {
        a.style.transition = b.style.transition = "opacity .6s"; a.style.opacity = 0; b.style.opacity = 0;
        d.style.transition = "opacity 1s"; d.style.opacity = 1;
        tween(1400, (t) => d.setAttribute("transform", `translate(${MEET[0]} ${MEET[1]}) scale(${.4 + t * .8})`));
        if (window.burstPetals) window.burstPetals(40);
      });
    });
    line(3, 12800);
    later(14000, () => $("replayStars").classList.add("on"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    build();
    reset();
    const sec = $("stars");
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting && !played && document.body.classList.contains("entered")) { played = true; play(); }
      });
    }, { threshold: .45 });
    io.observe(sec);
    $("replayStars").addEventListener("click", play);
    window.addEventListener("wedding:entered", () => {
      const r = sec.getBoundingClientRect();
      if (!played && r.top < innerHeight * .55 && r.bottom > innerHeight * .45) { played = true; play(); }
    });
  });
})();

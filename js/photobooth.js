/* ============================================================
   PHOTO BOOTH · camera → choose a frame → 3·2·1 → save / share
   Every frame is drawn on a canvas, so what guests see live is
   exactly what gets saved (1080×1440, portrait).
   ============================================================ */
(function () {
  const CFG = window.WEDDING_CONFIG;
  const IMG = "assets/images/";
  const W = 1080, H = 1440;
  const $ = (s) => document.querySelector(s);

  /* ---------- artwork ---------- */
  const art = {};
  function load(key, src) {
    return new Promise(res => { const i = new Image(); i.onload = () => { art[key] = i; res(); }; i.onerror = res; i.src = src; });
  }
  const ready = Promise.all([
    load("gold", IMG + "06_photo-frame.webp"),
    load("door", IMG + "07_door-frame.webp"),
    load("knot", IMG + "12_brahmamudi-knot.webp"),
    load("leaf", IMG + "14_rsvp-palm-leaf.webp"),
    load("tex", IMG + "16_parchment-texture.webp")
  ]).then(() => {
    if (!art.door) return;
    const c = document.createElement("canvas"); c.width = 690; c.height = 1213;
    const x = c.getContext("2d"); x.drawImage(art.door, 0, 0);
    x.clearRect(151, 375, 389, 766);
    art.doorOpen = c;
  });

  /* ---------- helpers ---------- */
  const T = (k) => window.t(k);
  const te = () => window.currentLang() === "te";
  function names() { return te() ? "పూజ ❖ రాహుల్" : "Pooja ❖ Rahul"; }
  const DATE = "18 · 12 · 2026";
  function scriptFont(px) { return te() ? `${px * .62}px "Tiro Telugu","Noto Serif Telugu",serif` : `${px}px "Great Vibes",cursive`; }
  function capsFont(px) { return `600 ${px}px Cinzel,"Cormorant Garamond",serif`; }

  // Draw the photo (video or image) to fill a box, cropped from the centre-top
  function cover(ctx, src, x, y, w, h, mirror) {
    const sw = src.videoWidth || src.naturalWidth || src.width, sh = src.videoHeight || src.naturalHeight || src.height;
    if (!sw || !sh) { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, "#d9c2b0"); g.addColorStop(1, "#b79aa8"); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); return; }
    const s = Math.max(w / sw, h / sh), cw = w / s, ch = h / s;
    const cx = (sw - cw) / 2, cy = Math.max(0, (sh - ch) * 0.35);
    ctx.save();
    if (mirror) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(src, cx, cy, cw, ch, 0, 0, w, h); }
    else ctx.drawImage(src, cx, cy, cw, ch, x, y, w, h);
    ctx.restore();
  }
  function caption(ctx, x, y, w, h, opts = {}) {
    // soft dark band at the bottom of the photo with names + date
    const g = ctx.createLinearGradient(0, y + h * .55, 0, y + h);
    g.addColorStop(0, "rgba(26,10,18,0)"); g.addColorStop(1, "rgba(26,10,18,.78)");
    ctx.fillStyle = g; ctx.fillRect(x, y + h * .55, w, h * .45);
    ctx.textAlign = "center"; ctx.fillStyle = opts.color || "#f2d27a";
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 8;
    ctx.font = scriptFont(opts.size || 86); ctx.fillText(names(), x + w / 2, y + h - (opts.size || 86) * .95);
    ctx.font = capsFont(30); ctx.fillStyle = "#fff3d6"; ctx.fillText(DATE, x + w / 2, y + h - 34);
    ctx.shadowBlur = 0;
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function archPath(ctx, x, y, w, h) {
    const r = w / 2;
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  }
  function paper(ctx, tint) {
    ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
    if (art.tex) { ctx.globalAlpha = .55; const p = ctx.createPattern(art.tex, "repeat"); ctx.fillStyle = p; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  function marigolds(ctx, y, count) {
    // a toranam of marigolds and mango leaves across the top
    const step = W / count;
    for (let i = 0; i < count; i++) {
      const cx = step * (i + .5), sag = Math.sin((i + .5) / count * Math.PI) * 26;
      ctx.fillStyle = "#3f6b2c"; ctx.beginPath(); ctx.ellipse(cx, y + 46 + sag, 11, 34, 0, 0, 7); ctx.fill();
      ctx.fillStyle = i % 2 ? "#f2a71b" : "#e8651c"; ctx.beginPath(); ctx.arc(cx, y + 10 + sag, 19, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.arc(cx - 5, y + 5 + sag, 7, 0, 7); ctx.fill();
    }
  }

  /* ---------- the five frames ---------- */
  const FRAMES = [
    {
      id: "gold", en: "Temple Gold", te: "బంగారు చట్రం",
      draw(ctx, src, mirror) {
        paper(ctx, "#f3e4d2");
        // frame artwork 744×1050, photo window x101–642, y140–913
        const fh = H - 40, fw = fh * 744 / 1050, fx = (W - fw) / 2, fy = 20, k = fw / 744;
        const px = fx + 96 * k, py = fy + 135 * k, pw = 551 * k, ph = 783 * k;
        cover(ctx, src, px, py, pw, ph, mirror);
        caption(ctx, px, py, pw, ph);
        if (art.gold) ctx.drawImage(art.gold, fx, fy, fw, fh);
      }
    },
    {
      id: "door", en: "Temple Door", te: "ఆలయ ద్వారం",
      draw(ctx, src, mirror) {
        const g = ctx.createRadialGradient(W / 2, H * .45, 100, W / 2, H * .45, H * .8);
        g.addColorStop(0, "#7a1f2b"); g.addColorStop(1, "#2c1420"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // door artwork 690×1213, doorway x151–540, y375–1141
        const fh = H - 30, fw = fh * 690 / 1213, fx = (W - fw) / 2, fy = 15, k = fw / 690;
        const px = fx + 145 * k, py = fy + 360 * k, pw = 401 * k, ph = 786 * k;
        cover(ctx, src, px, py, pw, ph, mirror);
        caption(ctx, px, py, pw, ph, { size: 72 });
        if (art.doorOpen) ctx.drawImage(art.doorOpen, fx, fy, fw, fh);
        ctx.fillStyle = "rgba(227,191,99,.35)";
        for (let i = 0; i < 9; i++) for (const sx of [fx / 2, W - fx / 2]) { ctx.beginPath(); ctx.arc(sx, 120 + i * 150, 6, 0, 7); ctx.fill(); }
      }
    },
    {
      id: "royal", en: "Royal Invite", te: "రాజసం",
      draw(ctx, src, mirror) {
        ctx.fillStyle = "#5a1a26"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#c9a24a"; ctx.lineWidth = 10; ctx.strokeRect(34, 34, W - 68, H - 68);
        ctx.lineWidth = 3; ctx.strokeRect(58, 58, W - 116, H - 116);
        for (const [cx, cy] of [[58, 58], [W - 58, 58], [58, H - 58], [W - 58, H - 58]]) { ctx.fillStyle = "#e3bf63"; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill(); }
        ctx.fillStyle = "#e3bf63"; ctx.textAlign = "center"; ctx.font = '700 70px "Noto Serif Telugu",serif'; ctx.fillText("ॐ", W / 2, 160);
        const ax = 150, ay = 200, aw = W - 300, ah = 900;
        ctx.save(); archPath(ctx, ax, ay, aw, ah); ctx.clip(); cover(ctx, src, ax, ay, aw, ah, mirror); ctx.restore();
        archPath(ctx, ax, ay, aw, ah); ctx.lineWidth = 14; ctx.strokeStyle = "#c9a24a"; ctx.stroke();
        archPath(ctx, ax - 18, ay - 18, aw + 36, ah + 18); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(227,191,99,.7)"; ctx.stroke();
        ctx.fillStyle = "#f2d27a"; ctx.font = scriptFont(120); ctx.fillText(names(), W / 2, 1250);
        ctx.fillStyle = "#fff3d6"; ctx.font = capsFont(36); ctx.fillText(DATE, W / 2, 1320);
      }
    },
    {
      id: "knot", en: "Brahmamudi", te: "బ్రహ్మముడి",
      draw(ctx, src, mirror) {
        paper(ctx, "#f5ead6");
        const px = 90, py = 80, pw = W - 180, ph = 930;
        ctx.save(); roundRect(ctx, px, py, pw, ph, 36); ctx.clip(); cover(ctx, src, px, py, pw, ph, mirror); ctx.restore();
        roundRect(ctx, px, py, pw, ph, 36); ctx.lineWidth = 8; ctx.strokeStyle = "#c9a24a"; ctx.stroke();
        if (art.knot) { const kw = W * .86, kh = kw * 768 / 1376; ctx.drawImage(art.knot, (W - kw) / 2, py + ph - kh * .5, kw, kh); }
        ctx.textAlign = "center"; ctx.fillStyle = "#7a1f2b"; ctx.font = scriptFont(100); ctx.fillText(names(), W / 2, 1335);
        ctx.fillStyle = "#8a6420"; ctx.font = capsFont(32); ctx.fillText(DATE, W / 2, 1395);
      }
    },
    {
      id: "toranam", en: "Pandiri", te: "పందిరి",
      draw(ctx, src, mirror) {
        cover(ctx, src, 0, 0, W, H, mirror);
        const v = ctx.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .45, H * .8);
        v.addColorStop(0, "rgba(26,10,18,0)"); v.addColorStop(1, "rgba(26,10,18,.65)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(122,31,43,.9)"; ctx.fillRect(0, 0, W, 34);
        marigolds(ctx, 14, 15);
        if (art.leaf) {
          const lw = W * .96, lh = lw * 418 / 1198, lx = (W - lw) / 2, ly = H - lh - 10;
          ctx.drawImage(art.leaf, lx, ly, lw, lh);
          ctx.textAlign = "center"; ctx.fillStyle = "#5a2a14"; ctx.font = scriptFont(84);
          ctx.fillText(names(), W / 2, ly + lh * .36);
          ctx.font = capsFont(26); ctx.fillText(DATE, W / 2, ly + lh * .5);
        }
      }
    }
  ];

  /* ---------- state ---------- */
  // idle → live → done.  Frame cycles any time; Power off stops the camera.
  let stream = null, facing = "user", frameIdx = 0, raf = 0, still = null, shotUrl = null, busy = false;
  const booth = () => document.getElementById("photobooth");
  const video = document.createElement("video");
  video.playsInline = true; video.muted = true; video.setAttribute("playsinline", "");
  const blank = document.createElement("canvas");

  function render(target, src, mirror, idx = frameIdx) {
    const ctx = target.getContext("2d");
    ctx.save(); ctx.scale(target.width / W, target.height / H);
    ctx.clearRect(0, 0, W, H);
    FRAMES[idx].draw(ctx, src, mirror);
    ctx.restore();
  }
  function loop() {
    render($("#pbView"), video, facing === "user");
    raf = requestAnimationFrame(loop);
  }
  function paintIdle() { render($("#pbView"), still || blank, false); }

  function setState(s) {
    const b = booth();
    b.classList.toggle("pb-live", s === "live");
    b.classList.toggle("pb-done", s === "done");
    b.classList.toggle("pb-idle", s === "idle");
    $("#pbCapLabel").textContent = T(s === "done" ? "pb.retake" : "pb.capture");
    $("#pbCapIcon").innerHTML = s === "done" ? ICON.retake : ICON.camera;
    $("#pbPower").disabled = s !== "live";
    $("#pbDownload").disabled = s !== "done";
    $("#pbShareBtn").disabled = s !== "done";
    $("#pbFlip").hidden = s !== "live";
  }
  const state = () => booth().classList.contains("pb-done") ? "done" : booth().classList.contains("pb-live") ? "live" : "idle";

  function frameName() {
    const f = FRAMES[frameIdx];
    $("#pbFrameName").textContent = `${frameIdx + 1}/${FRAMES.length} · ${te() ? f.te : f.en}`;
  }

  /* ---------- camera ---------- */
  function liveCameraAllowed() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) return false;
    const pol = document.permissionsPolicy || document.featurePolicy;
    try { if (pol && pol.allowsFeature && !pol.allowsFeature("camera")) return false; } catch (e) { /* ignore */ }
    return true;
  }
  async function startCamera() {
    $("#pbMsg").textContent = "";
    // Where the live camera is blocked (e.g. inside an embedded preview), open the phone's camera app instead
    if (!liveCameraAllowed()) { $("#pbSelfie").click(); return; }
    try {
      stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1706 } }, audio: false });
      video.srcObject = stream; await video.play();
      still = null; shotUrl = null;
      setState("live");
      cancelAnimationFrame(raf); loop();
    } catch (e) {
      $("#pbMsg").textContent = T(e && e.name === "NotAllowedError" ? "pb.denied" : "pb.tapAgain");
      setState(still ? "done" : "idle");
    }
  }
  function stopCamera() {
    cancelAnimationFrame(raf);
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }
  function powerOff() {
    stopCamera();
    setState(still ? "done" : "idle");
    paintIdle();
  }

  /* ---------- capture ---------- */
  function shoot() {
    if (busy) return; busy = true;
    let n = 3; const cd = $("#pbCount");
    cd.hidden = false; cd.textContent = n;
    const iv = setInterval(() => {
      n--;
      if (n > 0) { cd.textContent = n; return; }
      clearInterval(iv); cd.hidden = true; busy = false;
      const fl = $("#pbFlash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go");
      freeze(video, facing === "user");
    }, 900);
  }
  function freeze(src, mirror) {
    const c = document.createElement("canvas");
    c.width = src.videoWidth || src.naturalWidth; c.height = src.videoHeight || src.naturalHeight;
    const x = c.getContext("2d");
    if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
    x.drawImage(src, 0, 0);
    still = c;
    stopCamera();
    compose(true);
  }
  function compose(sendToAlbum) {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    render(c, still, false);
    shotUrl = c.toDataURL("image/jpeg", .9);
    paintIdle();
    setState("done");
    if (sendToAlbum) upload(shotUrl);
  }
  async function upload(url) {
    const st = $("#pbStatus");
    if (!CFG.API_URL) { st.textContent = ""; return; }
    st.textContent = T("pb.uploading");
    try {
      const r = await fetch(CFG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "photo", image: url, name: ($("#pbName").value || "").trim(), frame: FRAMES[frameIdx].id }) });
      const j = await r.json();
      st.textContent = j.ok ? T("pb.uploaded") : "";
    } catch (e) { st.textContent = ""; }
  }

  /* ---------- download & share ---------- */
  const fileName = () => `Pooja-Rahul-${FRAMES[frameIdx].id}.jpg`;
  function download() {
    if (!shotUrl) return;
    const a = document.createElement("a");
    a.href = shotUrl; a.download = fileName();
    document.body.appendChild(a); a.click(); a.remove();
    $("#pbStatus").textContent = T("pb.saveHint");
  }
  async function imageFile() {
    const blob = await (await fetch(shotUrl)).blob();
    return new File([blob], fileName(), { type: "image/jpeg" });
  }
  async function nativeShare() {
    try {
      const file = await imageFile();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Pooja ❖ Rahul", text: T("pb.shareText") + " " + location.href.split("#")[0] });
        return true;
      }
    } catch (e) { if (e && e.name === "AbortError") return true; }
    return false;
  }
  async function shareTo(app) {
    const link = location.href.split("#")[0];
    const text = T("pb.shareText") + " " + link;
    // Phones: the system share sheet sends the actual picture to the chosen app
    if (app !== "copy" && await nativeShare()) { closeSheet(); return; }
    const urls = {
      whatsapp: "https://wa.me/?text=" + encodeURIComponent(text),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(link),
      x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text)
    };
    if (app === "instagram") { download(); $("#pbSheetMsg").textContent = T("pb.instaHint"); return; }
    if (app === "copy") {
      try { await navigator.clipboard.writeText(link); $("#pbSheetMsg").textContent = T("pb.copied"); }
      catch (e) { $("#pbSheetMsg").textContent = link; }
      return;
    }
    download();
    window.open(urls[app], "_blank", "noopener");
  }
  function openSheet() {
    if (!shotUrl) return;
    $("#pbSheetImg").src = shotUrl; $("#pbSheetMsg").textContent = "";
    $("#pbSheet").hidden = false;
    requestAnimationFrame(() => $("#pbSheet").classList.add("open"));
  }
  function closeSheet() {
    const s = $("#pbSheet"); s.classList.remove("open");
    setTimeout(() => { s.hidden = true; }, 300);
  }

  /* ---------- icons ---------- */
  const sv = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    frame: sv('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'),
    camera: sv('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    retake: sv('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
    power: sv('<path d="M12 3v8"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/>'),
    download: sv('<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
    share: sv('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3"/>'),
    camOff: sv('<path d="M3 3l18 18"/><path d="M9 5h6l2 3h3v10M17 19H4V8h3"/><path d="M10 11a3 3 0 0 0 4 4"/>')
  };

  document.addEventListener("DOMContentLoaded", async () => {
    document.body.appendChild($("#pbSheet")); // sit above everything
    $("#pbFrameIcon").innerHTML = ICON.frame;
    $("#pbPowerIcon").innerHTML = ICON.power;
    $("#pbDownloadIcon").innerHTML = ICON.download;
    $("#pbShareIcon").innerHTML = ICON.share;
    $("#pbOffIcon").innerHTML = ICON.camOff;
    setState("idle");
    await ready;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    frameName(); paintIdle();
    document.addEventListener("wedding:lang", () => { frameName(); setState(state()); if (!stream) { if (still) compose(false); else paintIdle(); } });

    $("#pbFrameBtn").addEventListener("click", () => {
      frameIdx = (frameIdx + 1) % FRAMES.length; frameName();
      const v = $(".pb-viewport"); v.classList.remove("swap"); void v.offsetWidth; v.classList.add("swap");
      if (!stream) { if (still) compose(false); else paintIdle(); }
    });
    $("#pbCapture").addEventListener("click", () => {
      const s = state();
      if (s === "live") shoot();
      else { if (s === "done") { still = null; shotUrl = null; $("#pbStatus").textContent = ""; } startCamera(); }
    });
    $("#pbView").addEventListener("click", () => { if (state() === "idle") startCamera(); });
    $("#pbOff").addEventListener("click", () => startCamera());
    $("#pbPower").addEventListener("click", powerOff);
    $("#pbFlip").addEventListener("click", () => { facing = facing === "user" ? "environment" : "user"; startCamera(); });
    $("#pbDownload").addEventListener("click", download);
    $("#pbShareBtn").addEventListener("click", openSheet);
    $("#pbGallery").addEventListener("click", () => $("#pbFile").click());
    $("#pbSheetClose").addEventListener("click", closeSheet);
    $("#pbSheet").addEventListener("click", (e) => { if (e.target.id === "pbSheet") closeSheet(); });
    document.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", () => shareTo(b.dataset.share)));

    const onPick = (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const im = new Image();
      im.onload = () => { stopCamera(); freeze(im, false); URL.revokeObjectURL(im.src); };
      im.src = URL.createObjectURL(f);
      e.target.value = "";
    };
    $("#pbFile").addEventListener("change", onPick);
    $("#pbSelfie").addEventListener("change", onPick);

    // switch the camera off when guests scroll away
    new IntersectionObserver((ents) => ents.forEach(en => { if (!en.isIntersecting && stream) powerOff(); }), { threshold: 0 })
      .observe(booth());
  });
})();

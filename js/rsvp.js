/* ============================================================
   RSVP · "Akshintalu Pampandi"
   Sends to the Google Apps Script web app (see apps-script/)
   ============================================================ */
(function () {
  const CFG = window.WEDDING_CONFIG;
  const $ = (s) => document.querySelector(s);
  const EVENTS = [["vindu", "rsvp.evVindu"], ["muhurtham", "rsvp.evMuh"], ["vratham", "rsvp.evVrat"], ["reception", "rsvp.evRec"]];
  let count = 2;
  const picked = new Set(["muhurtham"]);

  const KALASAM = `<svg viewBox="0 0 30 38" aria-hidden="true">
    <path d="M7 10 Q4 4 9 2 Q12 6 11 10Z M23 10 Q26 4 21 2 Q18 6 19 10Z M15 9 Q12 2 15 0 Q18 2 15 9Z" fill="#4f7a3a"/>
    <ellipse cx="15" cy="11" rx="7" ry="4" fill="#7b4f2a"/>
    <path d="M9 14 h12 l2 4 Q30 26 22 34 H8 Q0 26 7 18Z" fill="#c9a24a" stroke="#8a6420"/>
    <path d="M6 24 H24" stroke="#7a1f2b" stroke-width="2"/></svg>`;

  function renderPickers() {
    const k = $("#kalasams"); k.textContent = "";
    for (let i = 1; i <= 8; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "kal"; b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(i === count));
      b.innerHTML = KALASAM + `<b>${i === 8 ? "8+" : i}</b>`;
      b.addEventListener("click", () => { count = i; renderPickers(); });
      k.appendChild(b);
    }
    const l = $("#lamps"); l.textContent = "";
    EVENTS.forEach(([key, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "lamp";
      b.setAttribute("aria-pressed", String(picked.has(key)));
      b.innerHTML = `<span class="flame"></span><span></span>`;
      b.lastChild.textContent = window.t(label);
      b.addEventListener("click", () => { picked.has(key) ? picked.delete(key) : picked.add(key); renderPickers(); });
      l.appendChild(b);
    });
  }

  async function send(payload) {
    if (!CFG.API_URL) {
      // Demo mode: nothing is saved
      console.info("[RSVP demo mode] set API_URL in js/config.js", payload);
      await new Promise(r => setTimeout(r, 700));
      return { ok: true, demo: true };
    }
    const res = await fetch(CFG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#rsvpForm"), err = $("#formErr"), btn = $("#rsvpBtn");
    renderPickers();
    document.addEventListener("wedding:lang", renderPickers);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      if (!name) { err.textContent = window.t("rsvp.errName"); form.name.focus(); return; }
      if (!picked.size) { err.textContent = window.t("rsvp.errEvents"); return; }

      const payload = {
        action: "rsvp",
        name,
        phone: String(fd.get("phone") || "").trim(),
        side: fd.get("side"),
        guests: count,
        events: EVENTS.map(e => e[0]).filter(k => picked.has(k)),
        blessing: String(fd.get("blessing") || "").trim(),
        lang: window.currentLang(),
        website: "" // honeypot
      };
      btn.disabled = true;
      const label = btn.lastElementChild; const old = label.innerHTML;
      label.textContent = window.t("rsvp.sending");
      try {
        const r = await send(payload);
        if (!r || !r.ok) throw new Error((r && r.error) || "failed");
        window.showerAkshintalu(220);
        form.hidden = true; $("#rsvpThanks").hidden = false;
        $("#leaf").scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (ex) {
        err.textContent = window.t("rsvp.errSend");
      } finally {
        btn.disabled = false; label.innerHTML = old;
      }
    });

    $("#rsvpAgain").addEventListener("click", () => {
      form.reset(); count = 2; picked.clear(); picked.add("muhurtham"); renderPickers();
      form.hidden = false; $("#rsvpThanks").hidden = true;
    });
  });
})();

(function () {
  "use strict";
  var T = window.LX_TEXT;
  var MAIL = "hi@lx-translations.com", TG = "https://t.me/lx_translations", CODE = "LX10";
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = store.get("lx-lang") === "ua" ? "ua" : "en";
  function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var ICON = {
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 11-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2L9.8 17a1.8 1.8 0 0 1-2.6-2.6L15 6.6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  /* ---------- quick order form (same fields as the big bureaus: contacts, request, services, who it's for) ---------- */
  var SERVICES = ["s.tr", "s.cert", "s.loc", "s.game", "s.mtpe", "s.sub", "s.dtp", "s.interp", "s.scrape"];

  function Form(host) {
    this.host = host;
    this.uid = "f" + Math.floor(Math.random() * 1e6);
    this.state = { services: [], files: [], who: "biz", voucher: "", vok: false };
    this.render();
  }
  Form.prototype.id = function (k) { return this.uid + "-" + k; };
  Form.prototype.keep = function () {
    var f = this.host.querySelector("form"), s = this.state;
    if (!f) return;
    s.name = f.name.value; s.email = f.email.value; s.phone = f.phone.value; s.text = f.text.value;
    s.voucher = f.voucher.value; s.consent = f.consent.checked;
  };
  Form.prototype.render = function () {
    var s = this.state, self = this, big = this.host.hasAttribute("data-big");
    var svc = SERVICES.map(function (k) {
      return '<label class="pick"><input type="checkbox" name="svc" value="' + k + '"' + (s.services.indexOf(k) >= 0 ? " checked" : "") + "><span>" + esc(t(k)) + "</span></label>";
    }).join("");
    this.host.innerHTML =
      (big ? "" : '<div class="card-head"><div><h2>' + t("form.title") + "</h2><p>" + t("form.sub") + '</p></div><span class="badge">' + t("form.badge") + "</span></div>") +
      '<form novalidate>' +
      '<div class="grid2">' +
        '<div class="f" data-f="name"><label for="' + this.id("nm") + '">' + t("form.name") + '</label><input class="in" id="' + this.id("nm") + '" name="name" autocomplete="name" value="' + esc(s.name || "") + '"><div class="msg"></div></div>' +
        '<div class="f" data-f="email"><label for="' + this.id("em") + '">' + t("form.email") + '</label><input class="in" id="' + this.id("em") + '" name="email" type="email" inputmode="email" autocomplete="email" value="' + esc(s.email || "") + '"><div class="msg"></div></div>' +
      "</div>" +
      '<div class="f"><label for="' + this.id("ph") + '">' + t("form.phone") + ' <span class="opt">' + t("form.opt") + '</span></label><input class="in" id="' + this.id("ph") + '" name="phone" type="tel" autocomplete="tel" value="' + esc(s.phone || "") + '"></div>' +
      '<div class="f" data-f="text"><label for="' + this.id("tx") + '">' + t("form.msg") + '</label><textarea class="in" id="' + this.id("tx") + '" name="text" rows="' + (big ? 5 : 3) + '" placeholder="' + esc(t("form.msgph")) + '">' + esc(s.text || "") + '</textarea><div class="msg"></div></div>' +
      '<div class="f"><span class="lbl">' + t("form.services") + ' <span class="opt">' + t("form.opt") + '</span></span><div class="picks">' + svc + "</div></div>" +
      '<div class="f"><span class="lbl">' + t("form.cat") + '</span><div class="seg" role="radiogroup">' +
        '<button type="button" role="radio" data-who="biz" aria-pressed="' + (s.who === "biz") + '">' + t("form.biz") + "</button>" +
        '<button type="button" role="radio" data-who="priv" aria-pressed="' + (s.who === "priv") + '">' + t("form.priv") + "</button></div></div>" +
      '<div class="f"><label class="attach">' + ICON.clip + "<span>" + t("form.attach") + '</span><input type="file" name="files" multiple></label><div class="chips" data-chips="files"></div></div>' +
      '<div class="f"><label for="' + this.id("vc") + '">' + t("form.voucher") + '</label><div class="voucher"><input class="in" id="' + this.id("vc") + '" name="voucher" placeholder="' + CODE + '" value="' + esc(s.voucher || "") + '" autocomplete="off"><button type="button" class="btn btn-ghost" data-apply>' + t("form.apply") + '</button></div><div class="vstate"></div></div>' +
      '<div class="f" data-f="consent" style="margin:0"><label class="check"><input type="checkbox" name="consent"' + (s.consent ? " checked" : "") + "><span>" + t("form.consent") + '</span></label><div class="msg" style="margin:-10px 0 12px"></div></div>' +
      '<button class="btn btn-brand submit" type="submit">' + t("form.submit") + ' <span aria-hidden="true">→</span></button>' +
      '<p class="note">' + ICON.lock + "<span>" + t("form.note") + "</span></p>" +
      "</form>";
    this.paintFiles(); this.paintVoucher();
    var f = this.host.querySelector("form");
    $$('input[name="svc"]', f).forEach(function (c) {
      c.addEventListener("change", function () {
        s.services = $$('input[name="svc"]:checked', f).map(function (x) { return x.value; });
      });
    });
    $$("[data-who]", f).forEach(function (b) {
      b.addEventListener("click", function () {
        s.who = b.getAttribute("data-who");
        $$("[data-who]", f).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
    var file = f.files;
    file.addEventListener("change", function () { self.add(file.files); file.value = ""; });
    f.voucher.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); self.apply(); } });
    f.querySelector("[data-apply]").addEventListener("click", function () { self.apply(); });
    ["name", "email", "text"].forEach(function (n) { f[n].addEventListener("input", function () { self.clear(n); }); });
    f.consent.addEventListener("change", function () { self.clear("consent"); });
    f.addEventListener("submit", function (e) { e.preventDefault(); self.submit(); });
  };
  Form.prototype.add = function (list) {
    var s = this.state;
    Array.prototype.forEach.call(list || [], function (fl) {
      if (!s.files.some(function (x) { return x.name === fl.name && x.size === fl.size; })) s.files.push(fl);
    });
    this.paintFiles();
  };
  function size(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  Form.prototype.paintFiles = function () {
    var s = this.state, self = this, box = this.host.querySelector('[data-chips="files"]');
    if (!box) return;
    box.innerHTML = s.files.map(function (fl, i) {
      return '<span class="chip file"><span>' + esc(fl.name) + " · " + size(fl.size) + '</span><button type="button" aria-label="Remove ' + esc(fl.name) + '" data-i="' + i + '">×</button></span>';
    }).join("");
    $$("button", box).forEach(function (b) { b.addEventListener("click", function () { s.files.splice(+b.getAttribute("data-i"), 1); self.paintFiles(); }); });
  };
  Form.prototype.apply = function () {
    var f = this.host.querySelector("form"), s = this.state;
    s.voucher = f.voucher.value.trim().toUpperCase(); f.voucher.value = s.voucher;
    s.vok = s.voucher === CODE; s.vtried = !!s.voucher; this.paintVoucher();
  };
  Form.prototype.paintVoucher = function () {
    var s = this.state, el = this.host.querySelector(".vstate");
    if (!el) return;
    el.className = "vstate" + (s.vtried ? (s.vok ? " ok" : " no") : "");
    el.textContent = s.vtried ? t(s.vok ? "v.ok" : "v.no") : "";
  };
  Form.prototype.err = function (k, msg) {
    var f = this.host.querySelector('[data-f="' + k + '"]');
    if (f) { f.classList.add("bad"); f.querySelector(".msg").textContent = msg; }
  };
  Form.prototype.clear = function (k) {
    var f = this.host.querySelector('[data-f="' + k + '"]');
    if (f) { f.classList.remove("bad"); f.querySelector(".msg").textContent = ""; }
  };
  Form.prototype.submit = function () {
    this.keep();
    var s = this.state, bad = [];
    ["name", "email", "text", "consent"].forEach(this.clear, this);
    if (!(s.name || "").trim()) bad.push(["name", t("e.req")]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((s.email || "").trim())) bad.push(["email", (s.email || "").trim() ? t("e.email") : t("e.req")]);
    if (!(s.text || "").trim() && !s.files.length) bad.push(["text", t("e.content")]);
    if (!s.consent) bad.push(["consent", t("e.consent")]);
    if (s.voucher && !s.vtried) this.apply();
    if (bad.length) {
      bad.forEach(function (b) { this.err(b[0], b[1]); }, this);
      var first = this.host.querySelector(".bad");
      if (first) { first.scrollIntoView({ block: "center", behavior: "smooth" }); var i = first.querySelector("input,textarea"); if (i) i.focus({ preventScroll: true }); }
      return;
    }
    this.done();
  };
  Form.prototype.done = function () {
    var s = this.state, d = new Date(), self = this;
    var oid = "LX-" + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + (Math.floor(Math.random() * 9000) + 1000);
    var body = [
      "Request " + oid,
      "Name: " + s.name.trim(),
      "Email: " + s.email.trim(),
      s.phone ? "Phone: " + s.phone.trim() : "",
      "Type: " + T.en[s.who === "biz" ? "form.biz" : "form.priv"],
      s.services.length ? "Services: " + s.services.map(function (k) { return T.en[k]; }).join(", ") : "",
      s.text ? "\n" + s.text.trim() + "\n" : "",
      s.files.length ? "Files (please attach): " + s.files.map(function (x) { return x.name; }).join(", ") : "",
      s.vok ? "Promo code: " + CODE + " (−10% first order)" : ""
    ].filter(Boolean).join("\n");
    var mail = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Quote request " + oid) + "&body=" + encodeURIComponent(body);
    this.host.innerHTML = '<div class="done" role="status"><div class="ok-ic">' + ICON.check + "</div><h3>" + t("ok.title") + "</h3><p>" + t("ok.text") + '</p><div class="oid">' + oid + '</div><div class="acts"><a class="btn btn-brand" href="' + mail + '">' + t("ok.mail") + '</a><a class="btn btn-ghost" href="' + TG + '" target="_blank" rel="noopener">' + t("ok.tg") + '</a><button type="button" class="btn btn-ghost" data-new>' + t("ok.new") + "</button></div><small>" + t("ok.small") + "</small></div>";
    this.host.querySelector("[data-new]").addEventListener("click", function () { self.state.files = []; self.state.text = ""; self.render(); });
    window.location.href = mail;
  };

  /* ---------- page ---------- */
  var forms = [];
  function paint() {
    document.documentElement.lang = lang === "ua" ? "uk" : "en";
    $$("[data-i]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i")); });
    $$("[data-tag-i]").forEach(function (el) { el.setAttribute("data-tag", t(el.getAttribute("data-tag-i"))); });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    forms.forEach(function (f) { if (f.host.querySelector("form")) { f.keep(); f.render(); } });
    words();
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { lang = b.getAttribute("data-lang"); store.set("lx-lang", lang); paint(); });
  });
  $$("[data-order-form]").forEach(function (h) { forms.push(new Form(h)); });

  /* "Any language." in other languages */
  var ROT = { en: ["Any language.", "Jede Sprache.", "Cualquier idioma.", "Każdy język.", "Toute langue.", "Будь-яка мова."], ua: ["Будь-яка мова.", "Any language.", "Jede Sprache.", "Cualquier idioma.", "Każdy język.", "Toute langue."] };
  var rotTimer, rotI = 0;
  function words() {
    var el = $(".rot span"); if (!el) return;
    clearInterval(rotTimer); rotI = 0; el.textContent = ROT[lang][0];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rotTimer = setInterval(function () {
      rotI = (rotI + 1) % ROT[lang].length;
      el.classList.add("out");
      setTimeout(function () { el.textContent = ROT[lang][rotI]; el.classList.remove("out"); el.classList.add("in"); requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove("in"); }); }); }, 380);
    }, 2200);
  }

  var top = $(".top");
  function onScroll() { if (top) top.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  $$("[data-code]").forEach(function (c) {
    c.addEventListener("click", function () {
      try { navigator.clipboard.writeText(CODE); } catch (e) {}
      var old = c.textContent; c.textContent = "✓ " + CODE; setTimeout(function () { c.textContent = old; }, 1400);
      forms.forEach(function (f) { var i = f.host.querySelector('[name="voucher"]'); if (i) { i.value = CODE; f.apply(); } });
    });
  });

  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0 });
    requestAnimationFrame(function () { requestAnimationFrame(function () { rv.forEach(function (el) { io.observe(el); }); }); });
  } else rv.forEach(function (el) { el.classList.add("on"); });

  var ck = $(".cookie");
  if (ck && !store.get("lx-ck")) { ck.hidden = false; ck.querySelector("button").addEventListener("click", function () { store.set("lx-ck", "1"); ck.hidden = true; }); }

  paint();
})();

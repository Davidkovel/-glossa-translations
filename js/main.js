(function () {
  "use strict";
  var T = window.LX_TEXT;
  var MAIL = "hi@glossa-translations.com", TG = "https://t.me/glossa_translations";
  var SERVICES = ["s.tr", "s.cert", "s.loc", "s.game", "s.edit", "s.mtpe", "s.sub", "s.interp", "s.scrape"];
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = store.get("gl-lang") === "ua" ? "ua" : "en";
  function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var CHECK = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var ARROW = '<i class="arr" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></i>';

  function input(id, name, ph, val, type, extra) {
    return '<div class="f" data-f="' + name + '"><label class="sr" for="' + id + '">' + esc(ph) + '</label><input class="in" id="' + id + '" name="' + name + '" type="' + (type || "text") + '" placeholder="' + esc(ph) + '" value="' + esc(val || "") + '"' + (extra || "") + '><div class="msg"></div></div>';
  }
  var who = /[?&]who=priv(&|$)/.test(location.search) ? "priv" : "biz";
  var EXT = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "png", "jpg", "jpeg"], ACCEPT = EXT.map(function (e) { return "." + e; }).join(",");

  /* ---------- a form: "quick" (mk-style contact form) or "cost" (choose services, leave a contact) ---------- */
  function Form(host) {
    this.host = host; this.kind = host.getAttribute("data-form");
    this.uid = "f" + Math.floor(Math.random() * 1e6);
    this.s = { services: [], who: who, files: [] };
    this.render();
  }
  Form.prototype.id = function (k) { return this.uid + k; };
  Form.prototype.keep = function () {
    var f = this.host.querySelector("form"), s = this.s;
    if (!f) return;
    ["name", "email", "phone", "text"].forEach(function (n) { if (f[n]) s[n] = f[n].value; });
  };
  Form.prototype.render = function () {
    var s = this.s, self = this, h;
    var picks = SERVICES.map(function (k) {
      return '<label class="pick"><input type="checkbox" name="svc" value="' + k + '"' + (s.services.indexOf(k) >= 0 ? " checked" : "") + "><span>" + esc(t(k)) + "</span></label>";
    }).join("");
    if (this.kind === "cost") {
      h = '<form novalidate class="costf">' +
        '<p class="lbl-s">' + t("cost.pick") + '</p><div class="picks" data-f="svc">' + picks + '<div class="msg"></div></div>' +
        '<div class="row">' + input(this.id("n"), "name", t("form.nameph"), s.name, "text", ' autocomplete="name"') + input(this.id("e"), "email", "Email", s.email, "email", ' autocomplete="email" inputmode="email"') + input(this.id("p"), "phone", t("form.phoneph"), s.phone, "tel", ' autocomplete="tel"') + "</div>" +
        '<div class="send"><button class="btn btn-primary" type="submit">' + t("cost.btn") + ' <span class="ar" aria-hidden="true">→</span></button><span>' + t("cost.note") + "</span></div>" +
        '<p class="legal">' + t("form.legal") + "</p></form>";
    } else if (this.kind === "rush") {
      h = '<form novalidate class="rushf">' +
        '<div class="row2">' + input(this.id("n"), "name", "Name", s.name, "text", ' autocomplete="name"') + input(this.id("e"), "email", "Email", s.email, "email", ' autocomplete="email" inputmode="email"') + "</div>" +
        input(this.id("p"), "phone", "Your phone number", s.phone, "tel", ' autocomplete="tel"') +
        '<div class="f" data-f="text"><label class="sr" for="' + this.id("t") + '">Your text</label><textarea class="in" id="' + this.id("t") + '" name="text" rows="4" placeholder="Your text">' + esc(s.text || "") + '</textarea><div class="msg"></div></div>' +
        '<div class="f" data-f="files"><label class="attach"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 11-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2L9.8 17a1.8 1.8 0 0 1-2.6-2.6L15 6.6"/></svg><span>Attach a file</span><small>PDF, DOC(X), XLS(X), TXT, PNG, JPG · up to 20 MB · max 5</small>' +
        '<input type="file" name="files" multiple accept="' + ACCEPT + '"></label><div class="chips"></div><div class="msg"></div></div>' +
        '<button class="btn btn-primary submit" type="submit">Contact me</button>' +
        '<p class="legal">' + t("form.legal") + "</p></form>";
    } else {
      h = '<form novalidate class="quickf">' +
        '<div class="row2">' + input(this.id("n"), "name", t("form.nameph"), s.name, "text", ' autocomplete="name"') + input(this.id("e"), "email", "Email", s.email, "email", ' autocomplete="email" inputmode="email"') + "</div>" +
        '<div class="row2">' + input(this.id("p"), "phone", t("form.phoneph"), s.phone, "tel", ' autocomplete="tel"') + "</div>" +
        '<div class="f" data-f="text"><label class="sr" for="' + this.id("t") + '">' + t("form.msg") + '</label><textarea class="in" id="' + this.id("t") + '" name="text" rows="4" placeholder="' + esc(t("form.msgph")) + '">' + esc(s.text || "") + '</textarea><div class="msg"></div></div>' +
        '<div class="f"><span class="lbl">' + t("form.services") + '</span><details class="multi"><summary class="in">' + this.summary() + '</summary><div class="multi-list">' + picks + "</div></details></div>" +
        '<p class="cat">' + t("form.cat") + "</p>" +
        '<div class="cats"><label class="check"><input type="radio" name="who" value="biz"' + (s.who === "biz" ? " checked" : "") + "><span>" + t("form.biz") + '</span></label><label class="check"><input type="radio" name="who" value="priv"' + (s.who === "priv" ? " checked" : "") + "><span>" + t("form.priv") + "</span></label></div>" +
        '<button class="btn btn-primary submit" type="submit">' + t("form.submit") + "</button>" +
        '<p class="legal">' + t("form.legal") + "</p></form>";
    }
    this.host.innerHTML = h;
    var f = this.host.querySelector("form");
    $$('input[name="svc"]', f).forEach(function (c) {
      c.addEventListener("change", function () {
        s.services = $$('input[name="svc"]:checked', f).map(function (x) { return x.value; });
        var sum = f.querySelector(".multi summary"); if (sum) sum.innerHTML = self.summary();
        self.clear("svc");
      });
    });
    $$('input[name="who"]', f).forEach(function (r) { r.addEventListener("change", function () { s.who = r.value; }); });
    var multi = f.querySelector(".multi");
    if (multi) document.addEventListener("click", function (e) { if (multi.open && !multi.contains(e.target)) multi.open = false; });
    /* files: only the names travel (the site never reads or uploads them); type, size and count are checked here */
    var fi = f.querySelector('input[type="file"]');
    if (fi) {
      this.paintFiles();
      fi.addEventListener("change", function () {
        var problems = [];
        Array.prototype.forEach.call(fi.files, function (fl) {
          var ext = (fl.name.split(".").pop() || "").toLowerCase();
          if (EXT.indexOf(ext) < 0) problems.push(fl.name + ": this file type is not accepted");
          else if (fl.size > 20 * 1048576) problems.push(fl.name + ": bigger than 20 MB, send it by email");
          else if (s.files.length >= 5) problems.push("Max 5 files");
          else if (!s.files.some(function (x) { return x.name === fl.name && x.size === fl.size; })) s.files.push({ name: fl.name.slice(0, 120), size: fl.size });
        });
        fi.value = "";
        self.paintFiles();
        if (problems.length) self.err("files", problems[0]); else self.clear("files");
      });
    }
    ["name", "email", "text"].forEach(function (n) { if (f[n]) f[n].addEventListener("input", function () { self.clear(n); }); });
    f.addEventListener("submit", function (e) { e.preventDefault(); self.submit(); });
  };
  Form.prototype.paintFiles = function () {
    var s = this.s, self = this, box = this.host.querySelector(".chips");
    if (!box) return;
    box.innerHTML = s.files.map(function (fl, i) {
      return '<span class="chip"><span>' + esc(fl.name) + " · " + (fl.size > 1048576 ? (fl.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(fl.size / 1024)) + " KB") + '</span><button type="button" aria-label="Remove ' + esc(fl.name) + '" data-i="' + i + '">×</button></span>';
    }).join("");
    $$("button", box).forEach(function (b) { b.addEventListener("click", function () { s.files.splice(+b.getAttribute("data-i"), 1); self.paintFiles(); }); });
  };
  Form.prototype.summary = function () {
    return this.s.services.length ? esc(this.s.services.map(t).join(", ")) : '<span class="ph">' + t("form.pick") + "</span>";
  };
  Form.prototype.err = function (k, m) { var f = this.host.querySelector('[data-f="' + k + '"]'); if (f) { f.classList.add("bad"); f.querySelector(".msg").textContent = m; } };
  Form.prototype.clear = function (k) { var f = this.host.querySelector('[data-f="' + k + '"]'); if (f) { f.classList.remove("bad"); f.querySelector(".msg").textContent = ""; } };
  Form.prototype.submit = function () {
    this.keep();
    var s = this.s, bad = [];
    ["name", "email", "text", "svc"].forEach(this.clear, this);
    if (!(s.name || "").trim()) bad.push(["name", t("e.req")]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((s.email || "").trim())) bad.push(["email", (s.email || "").trim() ? t("e.email") : t("e.req")]);
    if (this.kind === "cost" && !s.services.length) bad.push(["svc", t("e.svc")]);
    if (bad.length) {
      bad.forEach(function (b) { this.err(b[0], b[1]); }, this);
      var first = this.host.querySelector(".bad");
      if (first) { first.scrollIntoView({ block: "center", behavior: "smooth" }); var i = first.querySelector("input,textarea"); if (i) i.focus({ preventScroll: true }); }
      return;
    }
    this.done();
  };
  Form.prototype.done = function () {
    var s = this.s, self = this, d = new Date();
    var id = "GL-" + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + (Math.floor(Math.random() * 9000) + 1000);
    var body = [
      (this.kind === "cost" ? "Cost request " : "Request ") + id,
      "Name: " + s.name.trim(), "Email: " + s.email.trim(),
      s.phone ? "Phone: " + s.phone.trim() : "",
      this.kind === "quick" ? "Category: " + T.en[s.who === "biz" ? "form.biz" : "form.priv"] : "",
      s.services.length ? "Services: " + s.services.map(function (k) { return T.en[k]; }).join(", ") : "",
      s.text ? "\n" + s.text.trim() : "",
      s.files && s.files.length ? "\nFiles (please attach them to this email): " + s.files.map(function (x) { return x.name; }).join(", ") : ""
    ].filter(Boolean).join("\n");
    var mail = "mailto:" + MAIL + "?subject=" + encodeURIComponent((this.kind === "cost" ? "Cost request " : "Request ") + id) + "&body=" + encodeURIComponent(body);
    this.host.innerHTML = '<div class="done" role="status"><div class="ok-ic">' + CHECK + "</div><h3>" + t("ok.title") + "</h3><p>" + t("ok.text") + '</p><div class="oid">' + id + '</div><div class="acts"><a class="btn btn-primary" href="' + mail + '">' + t("ok.mail") + '</a><a class="btn btn-ghost" href="' + TG + '" target="_blank" rel="noopener">' + t("ok.tg") + '</a><button type="button" class="btn btn-ghost" data-new>' + t("ok.new") + "</button></div><small>" + t("ok.small") + "</small></div>";
    this.host.querySelector("[data-new]").addEventListener("click", function () { self.s = { services: [], who: who, files: [] }; self.render(); });
    window.location.href = mail;
  };

  /* ---------- page ---------- */
  var forms = $$("[data-form]").map(function (h) { return new Form(h); });
  function paint() {
    document.documentElement.lang = lang === "ua" ? "uk" : "en";
    $$("[data-i]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i")); });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    forms.forEach(function (f) { if (f.host.querySelector("form")) { f.keep(); f.render(); } });
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { lang = b.getAttribute("data-lang"); store.set("gl-lang", lang); paint(); });
  });

  var top = $(".top");
  function onScroll() { if (top) top.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0 });
    requestAnimationFrame(function () { requestAnimationFrame(function () { rv.forEach(function (el) { io.observe(el); }); }); });
  } else rv.forEach(function (el) { el.classList.add("on"); });

  var ck = $(".cookie");
  if (ck && !store.get("gl-ck")) { ck.hidden = false; ck.querySelector("button").addEventListener("click", function () { store.set("gl-ck", "1"); ck.hidden = true; }); }

  var mq = $(".marquee"), mqb = $("[data-mq]");
  if (mq && mqb) mqb.addEventListener("click", function () {
    var on = mq.classList.toggle("paused");
    mqb.setAttribute("aria-pressed", String(on));
    mqb.innerHTML = on ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  });

  paint();
})();

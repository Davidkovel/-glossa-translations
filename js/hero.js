/* The page translates itself.
   - The headline is the word "translation" and keeps translating itself (EN → UA → ES → DE → JA …).
   - Behind the whole page sits one giant pale word; every section has its own language (data-word="Word|CODE"),
     and when you scroll into the next section the letters shuffle into the next translation. */
(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scramble(el, text, dur, done) {
    var to = Array.from(text), from = Array.from(el.textContent), len = Math.max(to.length, from.length), t0 = performance.now();
    var pool = to.concat(from).filter(function (c) { return c.trim(); });
    if (still) { el.textContent = text; if (done) done(); return; }
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), ok = Math.floor(p * len), s = "";
      for (var i = 0; i < len; i++) s += i < ok ? (to[i] || "") : "<i>" + pool[(Math.random() * pool.length) | 0] + "</i>";
      el.innerHTML = s;
      if (p < 1) requestAnimationFrame(step); else { el.textContent = text; if (done) done(); }
    })(t0);
  }

  /* headline */
  var WORDS = [["Translation", "EN"], ["Переклад", "UA"], ["Traducción", "ES"], ["Übersetzung", "DE"], ["翻訳", "JA"], ["Tłumaczenie", "PL"], ["Traduction", "FR"], ["Çeviri", "TR"], ["ترجمة", "AR"], ["Traduzione", "IT"], ["번역", "KO"], ["Tradução", "PT"]];
  var w = document.querySelector(".morph .w"), tag = document.querySelector(".morph .lng"), k = 0;
  if (w && !still) setInterval(function () {
    if (document.hidden) return;
    k = (k + 1) % WORDS.length;
    w.dir = WORDS[k][1] === "AR" ? "rtl" : "ltr"; tag.textContent = WORDS[k][1];
    scramble(w, WORDS[k][0], 650);
  }, 2000);

  /* background word, one language per section */
  var bg = document.querySelector(".bgword span"), secs = Array.prototype.slice.call(document.querySelectorAll("[data-word]"));
  if (!bg || !secs.length) return;
  var current = "", busy = false, wanted = "";
  function pick() {
    var mid = innerHeight * .5, best = null;
    secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) best = s; });
    if (!best) return;
    var word = best.getAttribute("data-word").split("|")[0];
    if (word === current) return;
    wanted = word;
    if (busy) return;
    (function go() {
      busy = true; current = wanted;
      scramble(bg, wanted, 700, function () { busy = false; if (wanted !== current) go(); });
    })();
  }
  var ticking = false;
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; pick(); }); }
    if (!still) bg.parentNode.style.transform = "translate3d(" + (-scrollY * .06) + "px,0,0)";
  }, { passive: true });
  pick();
})();

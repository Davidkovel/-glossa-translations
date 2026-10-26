/* The two moving parts of the page:
   1) the intro — "hello" in many languages, then the name, then the page slides in (once per visit);
   2) the live card — one sentence translated in front of you, language after language, with the three checks ticking. */
(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function ready() { document.body.classList.add("ready"); startLive(); }

  /* ---------- intro ---------- */
  var intro = document.querySelector(".intro");
  if (!intro || still || ss("gl-intro")) {
    if (intro) intro.remove();
    requestAnimationFrame(ready);
  } else {
    ss("gl-intro", "1");
    document.documentElement.style.overflow = "hidden";
    var WORDS = ["Hello", "Привіт", "Hola", "Bonjour", "Hallo", "Ciao", "Cześć", "こんにちは", "Merhaba", "Olá"];
    var w = intro.querySelector(".word"), i = 0, timers = [];
    var tick = setInterval(function () { i++; if (i < WORDS.length) w.textContent = WORDS[i]; }, 230);
    function finish() {
      clearInterval(tick); timers.forEach(clearTimeout);
      intro.classList.add("named", "out");
      document.documentElement.style.overflow = "";
      ready();
      setTimeout(function () { intro.remove(); }, 1000);
    }
    timers.push(setTimeout(function () { clearInterval(tick); intro.classList.add("named"); }, 2300));
    timers.push(setTimeout(finish, 3100));
    intro.querySelector(".skipi").addEventListener("click", finish);
  }

  /* ---------- live translation card ---------- */
  var LINES = [
    ["UA", "Ваше замовлення вже в дорозі й прибуде завтра."],
    ["DE", "Ihre Bestellung ist unterwegs und kommt morgen an."],
    ["ES", "Tu pedido ya está en camino y llegará mañana."],
    ["JA", "ご注文の商品は発送済みで、明日お届けします。"],
    ["PL", "Twoje zamówienie jest w drodze i dotrze jutro."],
    ["FR", "Votre commande est en route et arrivera demain."],
    ["AR", "طلبك في الطريق وسيصل غدًا."],
    ["TR", "Siparişiniz yolda, yarın teslim edilecek."]
  ];
  var started = false;
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function startLive() {
    var card = document.querySelector(".live");
    if (!card || started) return; started = true;
    var out = card.querySelector(".out"), to = card.querySelector("[data-to]"), cks = card.querySelectorAll(".ck"), n = 0;
    function show(k) {
      var line = LINES[k % LINES.length], text = line[1], chars = Array.from(text), pool = chars.filter(function (c) { return c.trim(); });
      to.textContent = line[0];
      out.setAttribute("dir", line[0] === "AR" ? "rtl" : "ltr");
      out.setAttribute("lang", line[0].toLowerCase() === "ua" ? "uk" : line[0].toLowerCase());
      cks.forEach(function (c) { c.classList.remove("on"); });
      if (still) { out.textContent = text; cks.forEach(function (c) { c.classList.add("on"); }); return; }
      var t0 = performance.now(), dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), shown = Math.floor(p * chars.length), html = "";
        for (var j = 0; j < chars.length; j++) {
          if (j < shown || !chars[j].trim()) html += esc(chars[j]);
          else if (j < shown + 10) html += '<span class="c">' + esc(pool[(Math.random() * pool.length) | 0]) + "</span>";
        }
        out.innerHTML = html;
        if (p < 1) requestAnimationFrame(step);
        else {
          out.textContent = text;
          cks.forEach(function (c, ix) { setTimeout(function () { c.classList.add("on"); }, 350 + ix * 420); });
          setTimeout(function () { show(++n); }, 3900);
        }
      })(t0);
    }
    show(0);
  }
})();

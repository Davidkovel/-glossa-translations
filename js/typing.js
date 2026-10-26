/* The first screen: an English sentence is typed, then translated in front of you, language after language. */
(function () {
  "use strict";
  var src = document.querySelector("[data-src]"), out = document.querySelector("[data-out]"), to = document.querySelector("[data-to]");
  if (!src || !out) return;
  var langs = Array.prototype.slice.call(document.querySelectorAll(".live__langs span"));
  var LINES = [
    ["Your order ships tomorrow.", [["UA", "Ваше замовлення відправимо завтра."], ["DE", "Ihre Bestellung wird morgen versandt."], ["JA", "ご注文は明日発送されます。"]]],
    ["Welcome bonus: 100% up to €500.", [["ES", "Bono de bienvenida: 100% hasta 500 €."], ["AR", "مكافأة الترحيب: 100% حتى 500 €."], ["PL", "Bonus powitalny: 100% do 500 €."]]]
  ];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the static text in the HTML stays
  var CUR = '<span class="cur"></span>';
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  async function type(el, text, speed) {
    var ch = Array.from(text);
    for (var i = 0; i <= ch.length; i++) { el.innerHTML = esc(ch.slice(0, i).join("")) + CUR; await wait(speed); }
  }
  async function translate(el, text) {
    var ch = Array.from(text), pool = ch.filter(function (c) { return c.trim(); }), steps = 18;
    for (var s = 0; s <= steps; s++) {
      var n = Math.floor(s / steps * ch.length), h = esc(ch.slice(0, n).join(""));
      for (var j = n; j < Math.min(ch.length, n + 8); j++) h += ch[j].trim() ? "<i>" + esc(pool[(Math.random() * pool.length) | 0]) + "</i>" : " ";
      el.innerHTML = h; await wait(38);
    }
    el.textContent = text;
  }
  function mark(code) {
    to.textContent = code;
    langs.forEach(function (l) { l.classList.toggle("on", l.textContent === code); });
    out.dir = code === "AR" ? "rtl" : "ltr";
  }
  (async function loop() {
    await wait(900);
    for (;;) {
      for (var a = 0; a < LINES.length; a++) {
        out.textContent = ""; src.textContent = "";
        await type(src, LINES[a][0], 45);
        src.textContent = LINES[a][0];
        for (var b = 0; b < LINES[a][1].length; b++) {
          mark(LINES[a][1][b][0]);
          await translate(out, LINES[a][1][b][1]);
          await wait(1700);
        }
      }
    }
  })();
})();

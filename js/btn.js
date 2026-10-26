// Buttons that feel like iPhone / MacBook ones (style in botoes.css):
// the light follows the pointer (--mx/--my) and .premido stays on while the finger is down,
// so the press shows even on iOS, where :active needs a touch listener to fire.
(function () {
  var SEL = ".botao, .pilula, .doca a, .sub__indice a, .chips span";
  function alvo(e) { return e.target.closest && e.target.closest(SEL); }
  function luz(el, e) {
    var r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  }
  document.addEventListener("pointermove", function (e) { var el = alvo(e); if (el) luz(el, e); }, { passive: true });
  document.addEventListener("pointerdown", function (e) {
    var el = alvo(e); if (!el) return;
    luz(el, e); el.classList.add("premido");
    if (e.pointerType === "touch" && navigator.vibrate) navigator.vibrate(8); // a tiny tick on Android phones
  }, { passive: true });
  function solta() { var on = document.querySelectorAll(".premido"); for (var i = 0; i < on.length; i++) on[i].classList.remove("premido"); }
  document.addEventListener("pointerup", solta, { passive: true });
  document.addEventListener("pointercancel", solta, { passive: true });
  document.addEventListener("touchstart", function () {}, { passive: true }); // lets :active work on iOS Safari
})();

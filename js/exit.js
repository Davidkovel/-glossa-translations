/* Exit intent: when the visitor is about to leave, the price form appears with the −10% offer.
   PC: the mouse leaves through the top of the window. Phone: a fast scroll back up after reading, or 45 s without a request.
   Every time they try to leave, but not more than once a minute, and never again after a request was sent. */
(function () {
  "use strict";
  var box = document.querySelector(".exit");
  if (!box) return;
  var card = box.querySelector(".exit__card"), lastShown = 0, before = null, armed = false;
  setTimeout(function () { armed = true; }, 6000);
  function sent() { return !!document.querySelector(".done"); }
  function open() {
    var now = Date.now();
    if (!armed || sent() || !box.hidden || now - lastShown < 60000) return;
    lastShown = now; before = document.activeElement;
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add("on"); var i = box.querySelector("input"); if (i) i.focus({ preventScroll: true }); });
  }
  function close() {
    box.classList.remove("on");
    setTimeout(function () { box.hidden = true; if (before && before.focus) before.focus({ preventScroll: true }); }, 350);
  }
  box.querySelector(".exit__x").addEventListener("click", close);
  box.addEventListener("click", function (e) { if (!card.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      var f = box.querySelectorAll("a[href],button,input,textarea,select"), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  /* PC: mouse leaves through the top */
  document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY <= 4) open(); });
  /* phone: quick swipe back up after scrolling down a fair bit */
  if (matchMedia("(hover: none)").matches) {
    var lastY = scrollY, lastT = performance.now(), deepest = 0;
    addEventListener("scroll", function () {
      var y = scrollY, t = performance.now(), v = (lastY - y) / Math.max(1, t - lastT);
      deepest = Math.max(deepest, y);
      if (v > 2.2 && deepest > innerHeight * 2) open();
      lastY = y; lastT = t;
    }, { passive: true });
    setTimeout(open, 45000);
  }
})();

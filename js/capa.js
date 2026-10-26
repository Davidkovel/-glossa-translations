// While the TEN FOLD picture fills the screen it is the logo, so the header hides its own small one and its bar
// (.capa-no-topo on <html>). By half a screen of scroll the camera has flown into the picture and the header's logo comes in.
(function () {
  if (!document.querySelector(".capa")) return;
  var html = document.documentElement, ant = null, pedido = false;
  function ve() {
    pedido = false;
    var topo = scrollY < innerHeight * 0.5;
    if (topo !== ant) { ant = topo; html.classList.toggle("capa-no-topo", topo); }
  }
  addEventListener("scroll", function () { if (!pedido) { pedido = true; requestAnimationFrame(ve); } }, { passive: true });
  addEventListener("resize", ve, { passive: true });
  ve();
})();

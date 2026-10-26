/* A calm globe in its own box next to the hero text: blue dots, a few routes between places,
   three thin rings for the three checks. Slow, and it stops when it is off screen. */
(function () {
  "use strict";
  var canvas = document.getElementById("globe");
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE, box = canvas.parentNode;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.set(0, 0, 6);
  var globe = new THREE.Group(); scene.add(globe);
  globe.rotation.x = .35;

  function dotTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d");
    g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    return new THREE.CanvasTexture(c);
  }
  var N = 2600, pos = [], col = [], NAVY = new THREE.Color("#0f172a"), BLUE = new THREE.Color("#0369a1"), SEA = new THREE.Color("#b6c3d4");
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
    var x = Math.cos(th) * r, z = Math.sin(th) * r;
    var land = Math.sin(x * 4.1 + Math.cos(z * 3.3)) * Math.cos(y * 3.7 - x * 1.3) + Math.sin(z * 5.2 + y * 2.1) * .55;
    if (land < -.1 && i % 2) continue;
    pos.push(x, y, z);
    var c = land > .4 ? BLUE : land < -.1 ? SEA : NAVY;
    col.push(c.r, c.g, c.b);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  var dots = new THREE.Points(geo, new THREE.PointsMaterial({ size: .032, map: dotTexture(), vertexColors: true, transparent: true, alphaTest: .4, opacity: .85 }));
  globe.add(dots);
  /* back half fades behind a pale core */
  var core = new THREE.Mesh(new THREE.SphereGeometry(.98, 48, 48), new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: .78 }));
  core.renderOrder = -1; dots.renderOrder = 1;
  globe.add(core);

  /* routes between places */
  function rnd(k) { var s = Math.sin(k * 127.1) * 43758.5453; return s - Math.floor(s); }
  function onSphere(k) { var u = rnd(k), v = rnd(k + 9.3), t = 2 * Math.PI * u, p = Math.acos(2 * v - 1); return new THREE.Vector3(Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)); }
  var routes = [];
  for (var a = 0; a < 7; a++) {
    var p1 = onSphere(a * 3 + 1), p2 = onSphere(a * 3 + 2), pts = [];
    for (var s = 0; s <= 60; s++) { var t = s / 60; pts.push(p1.clone().lerp(p2, t).normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * .22)); }
    var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x0369a1, transparent: true, opacity: .75 }));
    line.userData = { off: a * .41, speed: .12 + (a % 3) * .03 };
    globe.add(line); routes.push(line);
    [p1, p2].forEach(function (p) {
      var pin = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0369a1 }));
      pin.position.copy(p.clone().multiplyScalar(1.01)); globe.add(pin);
    });
  }

  /* three thin rings: translator, editor, native proofreader */
  var rings = [];
  [[1.3, .25, .9], [1.45, -.45, .5], [1.6, .85, .3]].forEach(function (r) {
    var g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r[0], r[0], 0, Math.PI * 2).getPoints(160));
    var ring = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: .14 }));
    var h = new THREE.Group(); h.rotation.set(Math.PI / 2 + r[1], r[2], 0); h.add(ring); scene.add(h); rings.push(h);
  });

  function resize() {
    var w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  var visible = true, last = performance.now(), clock = 0;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(frame); } }).observe(box);
  }
  function frame(now) {
    if (!visible || document.hidden) return;
    var dt = Math.min((now - last) / 1000, .05); last = now; clock += dt;
    globe.rotation.y += dt * .06;
    routes.forEach(function (l) {
      var t = (clock * l.userData.speed + l.userData.off) % 1.5, head = Math.min(61, Math.floor(t * 61)), tail = Math.max(0, head - 30);
      l.geometry.setDrawRange(tail, Math.max(0, head - tail));
    });
    rings.forEach(function (h, j) { h.rotation.z += dt * (.03 + j * .01); });
    renderer.render(scene, camera);
    if (!still) requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { last = performance.now(); requestAnimationFrame(frame); } });
  requestAnimationFrame(frame);
})();

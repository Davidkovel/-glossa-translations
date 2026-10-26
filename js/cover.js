/* The cover: a gold globe that turns on its own and leans toward the pointer, a soft light that follows the cursor,
   and under the name the word "translation" changing language. It only draws while the cover is on screen. */
(function () {
  "use strict";
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the light that follows the cursor over the dark */
  var luz = document.querySelector(".luz");
  if (luz) addEventListener("pointermove", function (e) {
    luz.style.setProperty("--lx", e.clientX + "px"); luz.style.setProperty("--ly", e.clientY + "px");
  }, { passive: true });

  /* "translation" in many languages under the name */
  var WORDS = ["Translation · EN", "Переклад · UA", "Traducción · ES", "Übersetzung · DE", "翻訳 · JA", "Tłumaczenie · PL", "Traduction · FR", "Çeviri · TR", "ترجمة · AR", "번역 · KO"];
  var word = document.querySelector("[data-word]"), k = 0;
  if (word && !still) setInterval(function () {
    if (document.hidden || scrollY > innerHeight) return;
    k = (k + 1) % WORDS.length;
    var to = Array.from(WORDS[k]), t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / 500), n = Math.floor(p * to.length), s = "";
      for (var i = 0; i < to.length; i++) s += i < n ? to[i] : "<i>" + to[(Math.random() * to.length) | 0] + "</i>";
      word.innerHTML = s;
      if (p < 1) requestAnimationFrame(step); else word.textContent = WORDS[k];
    })(t0);
  }, 1800);

  /* the globe */
  var canvas = document.getElementById("globe");
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE, renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
  camera.position.set(0, 0, 5.2);
  var tilt = new THREE.Group(), globe = new THREE.Group(); scene.add(tilt); tilt.add(globe); tilt.rotation.x = .3;

  function dot() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.4, "rgba(255,255,255,.8)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  }
  var N = innerWidth < 700 ? 1800 : 3200, pos = [], col = [], GOLD = new THREE.Color("#f0dcae"), DIM = new THREE.Color("#5d4c2c");
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, x = Math.cos(th) * r, z = Math.sin(th) * r;
    var land = Math.sin(x * 4.1 + Math.cos(z * 3.3)) * Math.cos(y * 3.7 - x * 1.3) + Math.sin(z * 5.2 + y * 2.1) * .55;
    if (land < -.1 && i % 3) continue;
    pos.push(x, y, z); var c = land > .3 ? GOLD : DIM; col.push(c.r, c.g, c.b);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  var dots = new THREE.Points(geo, new THREE.PointsMaterial({ size: .044, map: dot(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  var core = new THREE.Mesh(new THREE.SphereGeometry(.975, 48, 48), new THREE.MeshBasicMaterial({ color: 0x0b0c0f, transparent: true, opacity: .8 }));
  core.renderOrder = -1; dots.renderOrder = 1; globe.add(core); globe.add(dots);

  function rnd(n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
  function onS(n) { var u = rnd(n), v = rnd(n + 9.3), t = 2 * Math.PI * u, p = Math.acos(2 * v - 1); return new THREE.Vector3(Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)); }
  var routes = [];
  for (var a = 0; a < 9; a++) {
    var p1 = onS(a * 3 + 1), p2 = onS(a * 3 + 2), pts = [];
    for (var s = 0; s <= 60; s++) { var t = s / 60; pts.push(p1.clone().lerp(p2, t).normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * (.18 + (a % 3) * .06))); }
    var l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf0dcae, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }));
    l.userData = { off: a * .41, sp: .14 + (a % 4) * .03 }; globe.add(l); routes.push(l);
  }
  [[1.3, .25, .9], [1.45, -.45, .5], [1.6, .85, .3]].forEach(function (q) {
    var g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, q[0], q[0], 0, Math.PI * 2).getPoints(160));
    var h = new THREE.Group(); h.rotation.set(Math.PI / 2 + q[1], q[2], 0);
    h.add(new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xd4ab43, transparent: true, opacity: .22 }))); tilt.add(h);
  });

  function size() {
    var w = canvas.clientWidth || 400, h = canvas.clientHeight || 400;   // clientWidth: the layer is scaled by the flight, the canvas is not
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  size(); addEventListener("resize", size);

  var px = 0, py = 0, tx = 0, ty = 0, clock = 0, last = performance.now();
  addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now;
    if (scrollY < innerHeight * 1.6 && !document.hidden) {
      clock += dt;
      px += (tx - px) * Math.min(1, dt * 3); py += (ty - py) * Math.min(1, dt * 3);
      globe.rotation.y += dt * (still ? 0 : .08);
      tilt.rotation.x = .3 + py * .5; tilt.rotation.y = px * .6;
      routes.forEach(function (l) {
        var tt = (clock * l.userData.sp + l.userData.off) % 1.5, hd = Math.min(61, Math.floor(tt * 61)), tl = Math.max(0, hd - 28);
        l.geometry.setDrawRange(tl, Math.max(0, hd - tl));
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

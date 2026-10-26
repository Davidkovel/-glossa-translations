/* The scene at the top of the page.
   - The headline is the word "translation", and it keeps translating itself (EN → UA → ES → DE → JA …).
   - The globe stays on screen while the text changes; the scroll drives it:
     routes between places appear (120+ languages), then three rings, one per check, then it settles for the price. */
(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (p, a, b) { var t = clamp((p - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- the word that translates itself ---------- */
  var WORDS = [["Translation", "EN"], ["Переклад", "UA"], ["Traducción", "ES"], ["Übersetzung", "DE"], ["翻訳", "JA"], ["Tłumaczenie", "PL"], ["Traduction", "FR"], ["Çeviri", "TR"], ["ترجمة", "AR"], ["Traduzione", "IT"], ["번역", "KO"], ["Tradução", "PT"]];
  var w = document.querySelector(".morph .w"), tag = document.querySelector(".morph .lng");
  if (w && !still) {
    var k = 0;
    var swap = function () {
      k = (k + 1) % WORDS.length;
      var to = Array.from(WORDS[k][0]), from = Array.from(w.textContent), len = Math.max(to.length, from.length), t0 = performance.now(), dur = 650;
      var pool = to.concat(from).filter(function (c) { return c.trim(); });
      w.dir = WORDS[k][1] === "AR" ? "rtl" : "ltr";
      tag.textContent = WORDS[k][1];
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), done = Math.floor(p * len), s = "";
        for (var i = 0; i < len; i++) {
          if (i < done) s += to[i] || "";
          else s += '<i>' + pool[(Math.random() * pool.length) | 0] + "</i>";
        }
        w.innerHTML = s;
        if (p < 1) requestAnimationFrame(step); else w.textContent = WORDS[k][0];
      })(t0);
    };
    setInterval(function () { if (!document.hidden) swap(); }, 2000);
  }

  /* ---------- the globe ---------- */
  var canvas = document.getElementById("globe"), cena = document.querySelector("[data-cena]");
  if (!canvas || !window.THREE || !cena) return;
  var THREE = window.THREE, renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 0, 6.4);
  var world = new THREE.Group(), globe = new THREE.Group();
  scene.add(world); world.add(globe); world.rotation.x = .32;

  function dotTex() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.4, "rgba(255,255,255,.85)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  }
  var small = innerWidth < 700, N = small ? 1800 : 3000, pos = [], col = [];
  var GOLD = new THREE.Color("#efd8a4"), DIM = new THREE.Color("#6b5c3e");
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, x = Math.cos(th) * r, z = Math.sin(th) * r;
    var land = Math.sin(x * 4.1 + Math.cos(z * 3.3)) * Math.cos(y * 3.7 - x * 1.3) + Math.sin(z * 5.2 + y * 2.1) * .55;
    if (land < -.1 && i % 3) continue;
    pos.push(x, y, z); var c = land > .3 ? GOLD : DIM; col.push(c.r, c.g, c.b);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  var dots = new THREE.Points(geo, new THREE.PointsMaterial({ size: small ? .05 : .04, map: dotTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  var core = new THREE.Mesh(new THREE.SphereGeometry(.975, 48, 48), new THREE.MeshBasicMaterial({ color: 0x09090b, transparent: true, opacity: .86 }));
  core.renderOrder = -1; dots.renderOrder = 1;
  globe.add(core); globe.add(dots);

  /* routes: a word travelling between two places */
  function rnd(n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
  function onSphere(n) { var u = rnd(n), v = rnd(n + 9.3), t = 2 * Math.PI * u, p = Math.acos(2 * v - 1); return new THREE.Vector3(Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)); }
  var routes = [];
  for (var a = 0; a < 12; a++) {
    var p1 = onSphere(a * 3 + 1), p2 = onSphere(a * 3 + 2), pts = [];
    for (var s = 0; s <= 60; s++) { var t = s / 60; pts.push(p1.clone().lerp(p2, t).normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * (.18 + (a % 3) * .06))); }
    var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xefd8a4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    line.userData = { off: a * .37, speed: .14 + (a % 4) * .03, need: a < 3 ? 0 : (a - 3) / 9 };
    globe.add(line); routes.push(line);
  }

  /* three rings, one per check */
  var rings = [];
  [[1.34, .25, .9], [1.52, -.45, .5], [1.7, .85, .3]].forEach(function (rr, j) {
    var g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, rr[0], rr[0], 0, Math.PI * 2).getPoints(180));
    var ring = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xd6b46e, transparent: true, opacity: 0 }));
    var bead = new THREE.Mesh(new THREE.SphereGeometry(.035, 14, 14), new THREE.MeshBasicMaterial({ color: 0xefd8a4, transparent: true, opacity: 0 }));
    var h = new THREE.Group(); h.rotation.set(Math.PI / 2 + rr[1], rr[2], 0); h.add(ring); h.add(bead); world.add(h);
    rings.push({ h: h, ring: ring, bead: bead, r: rr[0], at: .52 + j * .06 });
  });

  function resize() {
    var b = canvas.getBoundingClientRect();
    renderer.setSize(b.width, b.height, false); camera.aspect = b.width / b.height; camera.updateProjectionMatrix();
    small = innerWidth < 700;
  }
  resize(); addEventListener("resize", resize);

  var top = 0, height = 1;
  function measure() { var b = cena.getBoundingClientRect(); top = b.top + scrollY; height = b.height - innerHeight; }
  measure(); addEventListener("resize", measure); addEventListener("load", measure);

  var clock = 0, last = performance.now(), pv = 0, onScreen = true;
  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now; clock += dt;
    var p = clamp((scrollY - top) / Math.max(1, height), 0, 1);
    onScreen = scrollY < top + height + innerHeight;
    if (onScreen) {
      pv += (p - pv) * Math.min(1, dt * 4);
      globe.rotation.y = clock * (still ? 0 : .05) + pv * 2.6;
      var routesOn = smooth(pv, .2, .46);
      routes.forEach(function (l) {
        var vis = l.userData.need <= routesOn ? 1 : 0;
        l.material.opacity += ((vis ? .8 : 0) - l.material.opacity) * Math.min(1, dt * 5);
        var tt = (clock * l.userData.speed + l.userData.off) % 1.5, head = Math.min(61, Math.floor(tt * 61)), tail = Math.max(0, head - 28);
        l.geometry.setDrawRange(tail, Math.max(0, head - tail));
      });
      rings.forEach(function (R, j) {
        var o = smooth(pv, R.at, R.at + .05);
        R.ring.material.opacity = .55 * o; R.bead.material.opacity = o;
        var ang = clock * (.35 - j * .07) + j * 2;
        R.bead.position.set(Math.cos(ang) * R.r, Math.sin(ang) * R.r, 0);
        R.h.rotation.z += dt * .04;
      });
      world.scale.setScalar(1 + .1 * smooth(pv, .74, .95));
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

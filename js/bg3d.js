/* The space behind the whole site: stars, and a gold globe with "hello" in many languages pinned to it,
   arcs carrying words between them. On the first screen the globe stands on the right; as you scroll it turns
   and moves behind the content, dimmer, so it never fights the text. */
(function () {
  "use strict";
  var canvas = document.getElementById("bg3d");
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE, renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var phone = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.setClearColor(0, 0);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
  camera.position.set(0, 0, 7);

  function disc() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.4, "rgba(255,255,255,.8)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  }
  var DOT = disc();

  /* stars, in two depths so they drift at different speeds */
  function starLayer(n, spread, size, color) {
    var p = [];
    for (var i = 0; i < n; i++) p.push((Math.random() - .5) * spread, (Math.random() - .5) * spread * .7, -10 - Math.random() * 40);
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    var s = new THREE.Points(g, new THREE.PointsMaterial({ size: size, map: DOT, color: color, transparent: true, opacity: .85, depthWrite: false }));
    scene.add(s); return s;
  }
  var starsFar = starLayer(phone ? 600 : 1400, 120, .14, 0xc9c0ae), starsNear = starLayer(phone ? 200 : 450, 90, .22, 0xefd8a4);

  /* the globe */
  var world = new THREE.Group(), globe = new THREE.Group(); scene.add(world); world.add(globe); world.rotation.x = .28;
  var N = phone ? 1800 : 3200, pos = [], col = [], GOLD = new THREE.Color("#f0dcae"), DIM = new THREE.Color("#5d4c2c");
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, x = Math.cos(th) * r, z = Math.sin(th) * r;
    var land = Math.sin(x * 4.1 + Math.cos(z * 3.3)) * Math.cos(y * 3.7 - x * 1.3) + Math.sin(z * 5.2 + y * 2.1) * .55;
    if (land < -.1 && i % 3) continue;
    pos.push(x, y, z); var c = land > .3 ? GOLD : DIM; col.push(c.r, c.g, c.b);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  var dots = new THREE.Points(geo, new THREE.PointsMaterial({ size: .045, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  var core = new THREE.Mesh(new THREE.SphereGeometry(.975, 48, 48), new THREE.MeshBasicMaterial({ color: 0x0b0c0f, transparent: true, opacity: .82 }));
  core.renderOrder = -1; dots.renderOrder = 1; globe.add(core); globe.add(dots);

  /* "hello" pinned to places: [latitude, longitude, word, code] */
  var PLACES = [[51, -1, "Hello", "EN"], [52, 13, "Hallo", "DE"], [50, 30, "Привіт", "UA"], [40, -4, "Hola", "ES"], [36, 139, "こんにちは", "JA"],
    [48, 2, "Bonjour", "FR"], [24, 46, "مرحبا", "AR"], [52, 21, "Cześć", "PL"], [-23, -46, "Olá", "PT"], [39, 116, "你好", "ZH"], [41, 29, "Merhaba", "TR"], [37, 127, "안녕하세요", "KO"]];
  function vec(lat, lon, rad) {
    var p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-rad * Math.sin(p) * Math.cos(t), rad * Math.cos(p), rad * Math.sin(p) * Math.sin(t));
  }
  function label(word, code) {
    var c = document.createElement("canvas"), g = c.getContext("2d"), font = "600 44px Manrope, 'Segoe UI', 'Noto Sans', sans-serif";
    g.font = font; var w = Math.ceil(g.measureText(word).width) + 150; c.width = w; c.height = 84;
    g.font = font;
    g.fillStyle = "rgba(14,14,18,.82)"; g.strokeStyle = "rgba(212,171,67,.7)"; g.lineWidth = 2;
    var rr = 40; g.beginPath(); g.moveTo(rr, 2); g.arcTo(w - 2, 2, w - 2, 82, rr); g.arcTo(w - 2, 82, 2, 82, rr); g.arcTo(2, 82, 2, 2, rr); g.arcTo(2, 2, w - 2, 2, rr); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d4ab43"; g.font = "800 26px Manrope, sans-serif"; g.textBaseline = "middle"; g.fillText(code, 26, 43);
    g.fillStyle = "#f3ede2"; g.font = font; g.fillText(word, 92, 45);
    var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
    s.scale.set(w / 84 * .22, .22, 1); return s;
  }
  var pins = [];
  PLACES.forEach(function (pl, ix) {
    var base = vec(pl[0], pl[1], 1.01), tip = vec(pl[0], pl[1], 1.25 + (ix % 3) * .2);
    var dot = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 10), new THREE.MeshBasicMaterial({ color: 0xefd8a4, transparent: true }));
    dot.position.copy(base);
    var stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([base, tip]), new THREE.LineBasicMaterial({ color: 0xd4ab43, transparent: true, opacity: .6 }));
    var tag = label(pl[2], pl[3]); tag.position.copy(tip).multiplyScalar(1.06);
    globe.add(dot); globe.add(stem); globe.add(tag);
    pins.push({ base: base, dot: dot, stem: stem, tag: tag });
  });

  /* arcs: a word flying from one language to the next */
  var arcs = [];
  for (var a = 0; a < PLACES.length; a++) {
    var p1 = vec(PLACES[a][0], PLACES[a][1], 1), p2 = vec(PLACES[(a + 3) % PLACES.length][0], PLACES[(a + 3) % PLACES.length][1], 1), pts = [];
    for (var s = 0; s <= 64; s++) { var t = s / 64; pts.push(p1.clone().lerp(p2, t).normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * .32)); }
    var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf0dcae, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    line.userData = { off: a * .53, sp: .16 + (a % 4) * .03 }; globe.add(line); arcs.push(line);
  }

  /* one thin ring per quality check */
  [[1.55, .25, .9], [1.72, -.45, .5], [1.9, .85, .3]].forEach(function (q) {
    var g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, q[0], q[0], 0, Math.PI * 2).getPoints(180));
    var h = new THREE.Group(); h.rotation.set(Math.PI / 2 + q[1], q[2], 0);
    h.add(new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xd4ab43, transparent: true, opacity: .16 }))); world.add(h);
  });

  function resize() {
    phone = innerWidth < 760;
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  var mx = 0, my = 0, tx = 0, ty = 0, last = performance.now(), clock = 0, cam = new THREE.Vector3(0, 0, 1), tmp = new THREE.Vector3();
  addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  var smooth = function (v, a, b) { var k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };

  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now;
    if (!document.hidden) {
      clock += dt;
      var h = innerHeight, p = smooth(scrollY, h * .15, h * 1.1);       // 0 on the first screen, 1 once you are into the page
      mx += (tx - mx) * Math.min(1, dt * 2.5); my += (ty - my) * Math.min(1, dt * 2.5);
      var wide = innerWidth / innerHeight > 1.1;
      var hx = wide ? 1.7 : 0, hy = wide ? -.05 : -1.25, hs = wide ? .92 : .72;     // hero: right side (phone: under the text)
      world.position.set(hx * (1 - p) + 0 * p, hy * (1 - p) + 0 * p, -1.2 * p);
      world.scale.setScalar(hs + (.95 - hs) * p);
      globe.rotation.y = clock * (still ? 0 : .06) + scrollY * .0012;
      world.rotation.x = .28 + my * .25; world.rotation.y = mx * .35;
      canvas.style.opacity = String(1 - .55 * p);
      starsFar.position.y = scrollY * .0008; starsNear.position.y = scrollY * .0022;
      starsNear.position.x = mx * .4;
      pins.forEach(function (pn) {
        tmp.copy(pn.base).applyQuaternion(globe.quaternion).applyQuaternion(world.quaternion).normalize();
        var f = Math.max(0, Math.min(1, (tmp.dot(cam) + .1) * 2.2));
        pn.tag.material.opacity = f; pn.stem.material.opacity = .6 * f; pn.dot.material.opacity = f;
      });
      arcs.forEach(function (l) {
        var tt = (clock * l.userData.sp + l.userData.off) % 1.5, hd = Math.min(65, Math.floor(tt * 65)), tl = Math.max(0, hd - 30);
        l.geometry.setDrawRange(tl, Math.max(0, hd - tl));
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

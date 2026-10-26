/* The globe behind the site: a sphere of gold dots, letters from many alphabets on its surface,
   arcs that carry a word from one place to another, and three rings for the three quality checks.
   It never leaves the screen; scrolling moves it between poses. */
(function () {
  "use strict";
  var canvas = document.getElementById("globe");
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.innerWidth < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);
  var world = new THREE.Group(); scene.add(world);
  var globe = new THREE.Group(); world.add(globe);
  var GOLD = new THREE.Color("#d8b878"), PALE = new THREE.Color("#f0d9a6");

  /* dots: a fibonacci sphere, denser near the "land" bands so it reads as a planet, not a ball */
  function dotTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.35, "rgba(255,255,255,.8)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var N = small ? 1500 : 3200, pos = [], col = [];
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
    var x = Math.cos(th) * r, z = Math.sin(th) * r;
    var land = Math.sin(x * 4.1 + Math.cos(z * 3.3)) * Math.cos(y * 3.7 - x * 1.3) + Math.sin(z * 5.2 + y * 2.1) * .55;
    if (land < -.15 && (i % 3)) continue;
    pos.push(x, y, z);
    var c = land > .35 ? PALE : GOLD, k = land > .35 ? 1 : .55;
    col.push(c.r * k, c.g * k, c.b * k);
  }
  var dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  dotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  var dots = new THREE.Points(dotsGeo, new THREE.PointsMaterial({ size: small ? .045 : .042, map: dotTexture(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
  globe.add(dots);

  /* a faint solid core so the back half is dimmed */
  var core = new THREE.Mesh(new THREE.SphereGeometry(.985, 48, 48), new THREE.MeshBasicMaterial({ color: 0x08080a, transparent: true, opacity: .7 }));
  core.renderOrder = -1; dots.renderOrder = 1;
  globe.add(core);

  /* letters from many scripts, sitting just above the surface */
  var GLYPHS = ["A", "Ж", "字", "あ", "ع", "Ω", "ก", "한", "ש", "ß", "Ç", "ñ", "Ї", "ह", "ა", "Ł", "語", "ü", "Ψ", "ç", "Я", "ب", "ॐ", "ø", "ê", "文", "ヨ", "Ğ", "Ą", "ő"];
  function glyphTexture(ch) {
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var g = c.getContext("2d");
    g.font = "500 76px 'Inter', 'Noto Sans', 'Segoe UI', 'Arial Unicode MS', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(240,217,166,.9)"; g.shadowBlur = 18;
    g.fillStyle = "#f6e6c2"; g.fillText(ch, 64, 70);
    var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
  }
  var glyphs = [];
  GLYPHS.forEach(function (ch, j) {
    var phi = Math.acos(1 - 2 * (j + .5) / GLYPHS.length), th = Math.PI * (1 + Math.sqrt(5)) * j;
    var v = new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(1.1);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(ch), transparent: true, depthWrite: false, opacity: 0 }));
    sp.position.copy(v); sp.scale.setScalar(.2);
    sp.userData = { base: v.clone(), seed: j * 1.7 };
    globe.add(sp); glyphs.push(sp);
  });

  /* arcs: a word travelling between two places */
  function arcPoints(a, b, lift) {
    var pts = [];
    for (var s = 0; s <= 64; s++) {
      var t = s / 64, p = new THREE.Vector3().copy(a).lerp(b, t).normalize();
      pts.push(p.multiplyScalar(1 + Math.sin(Math.PI * t) * lift));
    }
    return pts;
  }
  var arcs = [];
  for (var a = 0; a < (small ? 5 : 9); a++) {
    var g1 = glyphs[(a * 7) % glyphs.length].userData.base, g2 = glyphs[(a * 11 + 5) % glyphs.length].userData.base;
    var geo = new THREE.BufferGeometry().setFromPoints(arcPoints(g1.clone().normalize(), g2.clone().normalize(), .28 + (a % 3) * .08));
    var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xf0d9a6, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    line.userData = { off: a * .37, speed: .16 + (a % 4) * .03 };
    globe.add(line); arcs.push(line);
  }

  /* three rings: translator, editor, native proofreader */
  var rings = [];
  [[1.42, .32, .9], [1.62, -.5, .55], [1.84, .9, .35]].forEach(function (r, j) {
    var curve = new THREE.EllipseCurve(0, 0, r[0], r[0], 0, Math.PI * 2);
    var geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
    var ring = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0xd8b878, transparent: true, opacity: .16 + j * .02 }));
    var holder = new THREE.Group(); holder.rotation.set(Math.PI / 2 + r[1], r[2], 0); holder.add(ring);
    var bead = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf6e6c2 }));
    holder.add(bead);
    world.add(holder);
    rings.push({ holder: holder, bead: bead, r: r[0], speed: .22 - j * .05, phase: j * 2.1 });
  });

  /* poses along the page: [x, y, scale] at scroll progress p (desktop); phones keep it centred and lower */
  var POSES = document.body.hasAttribute("data-globe-side")
    ? [[0, [1.25, -.1, 1.05]], [1, [1.25, -.1, 1.05]]]
    : [[0, [0, -1.12, 1.5]], [.18, [1.35, -.05, 1]], [.42, [-1.45, .05, .92]], [.68, [1.4, 0, .95]], [1, [0, .15, .8]]];
  function poseAt(p) {
    for (var q = 1; q < POSES.length; q++) {
      if (p <= POSES[q][0]) {
        var a = POSES[q - 1], b = POSES[q], t = (p - a[0]) / (b[0] - a[0]);
        t = t * t * (3 - 2 * t);
        return [a[1][0] + (b[1][0] - a[1][0]) * t, a[1][1] + (b[1][1] - a[1][1]) * t, a[1][2] + (b[1][2] - a[1][2]) * t];
      }
    }
    return POSES[POSES.length - 1][1];
  }

  var W = 0, H = 0;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  var mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (e) { tx = (e.clientX / W - .5); ty = (e.clientY / H - .5); }, { passive: true });

  var cur = poseAt(0), clock = 0, last = performance.now(), running = true, tmp = new THREE.Vector3();
  document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, .05); last = now; clock += dt;
    var max = Math.max(1, document.documentElement.scrollHeight - H);
    var prog = Math.min(1, window.scrollY / max), target = poseAt(prog);
    if (small) target = [0, prog < .06 ? -.62 : -.15, target[2] * .78];
    for (var k = 0; k < 3; k++) cur[k] += (target[k] - cur[k]) * Math.min(1, dt * 3);
    mx += (tx - mx) * Math.min(1, dt * 2.5); my += (ty - my) * Math.min(1, dt * 2.5);

    var spread = W / H > 1 ? 1 : .55;
    world.position.set(cur[0] * spread, cur[1], 0);
    world.scale.setScalar(cur[2]);
    globe.rotation.y += dt * (still ? 0 : .07);
    globe.rotation.x = .28 + my * .25;
    world.rotation.y = mx * .35;

    var camDir = new THREE.Vector3(0, 0, 1);
    glyphs.forEach(function (sp) {
      tmp.copy(sp.userData.base).applyQuaternion(globe.quaternion).normalize();
      var facing = tmp.dot(camDir);
      var pulse = .55 + .45 * Math.sin(clock * 1.3 + sp.userData.seed);
      sp.material.opacity = Math.max(0, facing) * (.35 + .65 * pulse);
      sp.scale.setScalar(.15 + .07 * pulse);
    });
    arcs.forEach(function (l) {
      var t = (clock * l.userData.speed + l.userData.off) % 1.4;
      var head = Math.min(65, Math.floor(t * 65)), tail = Math.max(0, head - 26);
      l.geometry.setDrawRange(tail, Math.max(0, head - tail));
    });
    rings.forEach(function (r) {
      var a = clock * r.speed + r.phase;
      r.bead.position.set(Math.cos(a) * r.r, Math.sin(a) * r.r, 0);
      r.holder.rotation.z += dt * r.speed * .2;
    });

    renderer.render(scene, camera);
    if (!still) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (still) window.addEventListener("scroll", function () { requestAnimationFrame(frame); }, { passive: true });
})();

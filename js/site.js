(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MAIL = 'hi@lingvo-translations.com';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header line once the page moves */
  const bar = $('.bar');
  const onScroll = () => bar.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* marquees: duplicate the track so the -50% loop has no gap */
  $$('[data-faixa] > div').forEach((t) => { t.innerHTML += t.innerHTML; });

  /* things that play once when they come into view */
  const seen = (el, fn, margin = '-20% 0px') => {
    if (still) return fn();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin });
    io.observe(el);
  };

  $$('[data-in]').forEach((el) => seen(el, () => el.classList.add('on'), '0px 0px -25% 0px'));

  /* clients showcase: a logo picks the slide; it moves on by itself every 5 s */
  const show = $('[data-show]');
  if (show) {
    const tabs = $$('[data-tab]', show);
    const slides = $$('[data-slide]', show);
    let at = 0, timer = null;
    const go = (i) => {
      at = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === at)));
      slides.forEach((s, k) => s.classList.toggle('is-on', k === at));
    };
    const run = () => { clearInterval(timer); if (!still) timer = setInterval(() => go(at + 1), 5000); };
    tabs.forEach((t, k) => t.addEventListener('click', () => { go(k); run(); }));
    show.addEventListener('mouseenter', () => { clearInterval(timer); show.classList.add('is-paused'); });
    show.addEventListener('mouseleave', () => { show.classList.remove('is-paused'); run(); });
    run();
  }

  /* numbers count up */
  $$('[data-conta]').forEach((el) => {
    const end = +el.dataset.conta;
    seen(el, () => {
      if (still) return;
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, '0px');
  });

  /* hero buttons preselect the form */
  $$('[data-client]').forEach((a) => a.addEventListener('click', () => {
    const r = $(`.who input[value="${a.dataset.client}"]`);
    if (r) r.checked = true;
    if (a.dataset.service) { const c = $(`.chips input[value="${a.dataset.service}"]`); if (c) c.checked = true; }
  }));

  /* no backend: the request opens in the visitor's email app */
  const send = (fields) => {
    const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Quote request') + '&body=' + encodeURIComponent(body);
  };
  const form = $('[data-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    send({
      Service: d.get('service'),
      From: d.get('from'),
      To: d.get('to'),
      Name: d.get('name'),
      Contact: d.get('contact'),
      About: d.get('text'),
    });
    $('[data-ok]').hidden = false;
  });

  /* exit intent: once per visit */
  const exit = $('[data-exit]');
  let shown = null;
  try { shown = sessionStorage.getItem('lingvo-exit'); } catch (_) {}
  const open = () => {
    if (shown) return;
    shown = '1';
    try { sessionStorage.setItem('lingvo-exit', '1'); } catch (_) {}
    exit.hidden = false;
  };
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8 && scrollY > 600) open(); });
  $('[data-exit-close]')?.addEventListener('click', () => { exit.hidden = true; });
  exit?.addEventListener('click', (e) => { if (e.target === exit) exit.hidden = true; });
  $('[data-exit-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    send({ Email: new FormData(e.target).get('email'), Request: 'Price for a translation (exit form)' });
    exit.hidden = true;
  });

  /* ===== the planet and the scroll globe =====
     One dotted globe drawn twice: big and rising at the bottom of the hero, with greetings at their real
     places on it; small in the corner once you scroll, with a ring for how far down the page you are. */
  const HELLO = [
    ['Hello', 'English', 51.5, -0.1], ['Hola', 'Español', 40.4, -3.7], ['Bonjour', 'Français', 48.9, 2.35],
    ['Hallo', 'Deutsch', 52.5, 13.4], ['Ciao', 'Italiano', 41.9, 12.5], ['Cześć', 'Polski', 52.2, 21],
    ['Merhaba', 'Türkçe', 41, 29], ['Γεια σου', 'Ελληνικά', 38, 23.7], ['שלום', 'עברית', 31.8, 35.2],
    ['مرحبا', 'العربية', 24.7, 46.7], ['Сәлем', 'Қазақша', 51.2, 71.4], ['नमस्ते', 'हिन्दी', 28.6, 77.2],
    ['Xin chào', 'Tiếng Việt', 21, 105.8], ['你好', '中文', 39.9, 116.4], ['안녕하세요', '한국어', 37.6, 127],
    ['こんにちは', '日本語', 35.7, 139.7], ['Olá', 'Português', -23.5, -46.6], ['Hi', 'English', 40.7, -74],
  ];
  const RAD = Math.PI / 180;
  const onSphere = (lat, lon) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD)];
  const sphere = (n) => {
    const out = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (let k = 0; k < n; k++) { const y = 1 - (k / (n - 1)) * 2, r = Math.sqrt(1 - y * y); out.push([Math.cos(ga * k) * r, y, Math.sin(ga * k) * r]); }
    return out;
  };
  const projector = (cx, cy, R, rot, tilt) => ([x, y, z]) => {
    const x1 = x * Math.cos(rot) + z * Math.sin(rot), z1 = -x * Math.sin(rot) + z * Math.cos(rot);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    return [cx + x1 * R, cy - y2 * R, z2];
  };
  const dpr = Math.min(2, devicePixelRatio || 1);
  const fit = (c) => { const r = c.getBoundingClientRect(); c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); };

  const planet = $('[data-planet]');
  const big = planet && { g: planet.getContext('2d'), pts: sphere(2200), seen: true };
  const hi = big && document.createElement('span');
  if (big) {
    fit(planet);
    addEventListener('resize', () => fit(planet));
    hi.className = 'planet__hi'; hi.setAttribute('aria-hidden', 'true'); hi.style.opacity = 0; document.body.append(hi);
  }
  const smooth = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  /* hero: a huge planet rising at the bottom. After the first screen it becomes a ball behind the page
     that drifts left, right, left, right and ends in the centre, turned to the country of the current hello. */
  const drawPlanet = (t) => {
    const { g, pts } = big, W = planet.width, H = planet.height, phone = innerWidth < 700;
    const max = document.documentElement.scrollHeight - innerHeight;
    const e = smooth(Math.min(1, scrollY / innerHeight));
    const u = Math.max(0, Math.min(1, (scrollY - innerHeight) / Math.max(1, max - innerHeight)));
    const X = phone ? [.5, .5] : [.5, .16, .84, .5];
    const seg = u * (X.length - 1), k = Math.min(X.length - 2, Math.floor(seg));
    const fxT = lerp(X[k], X[k + 1], smooth(seg - k));
    big.fx = big.fx == null || still ? fxT : big.fx + (fxT - big.fx) * .05;
    const fx = big.fx;
    const R0 = Math.max(W * .86, H * .8), R1 = Math.min(W, H) * (phone ? .42 : .3);
    const R = lerp(R0, R1, e), cx = lerp(W / 2, fx * W, e), cy = lerp(H * .4 + R0, H * .54, e);
    const at0 = mini && mini.at >= 0 ? Math.min(mini.at, HELLO.length - 1) : 0;
    const rotT = lerp(t / 50000 + scrollY * .0012, HELLO[at0][3] * RAD - Math.PI / 2, e);
    big.rot = big.rot == null || still ? rotT : big.rot + (rotT - big.rot) * .03;
    const rot = big.rot, tilt = lerp(-.5, .45, e);
    const P = projector(cx, cy, R, rot, tilt), fade = lerp(1, .32, e);
    g.clearRect(0, 0, W, H);
    const rim = g.createRadialGradient(cx, cy, R * .97, cx, cy, R * 1.08);
    rim.addColorStop(0, 'rgba(127,178,255,0)'); rim.addColorStop(.3, `rgba(127,178,255,${.55 * fade})`); rim.addColorStop(1, 'rgba(127,178,255,0)');
    g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, R * 1.08, 0, 7); g.fill();
    g.fillStyle = '#05060f'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    for (const q of pts) {
      const [x, y, z] = P(q);
      if (z < -.05 || y > H + 4 || y < -4) continue;
      g.fillStyle = `rgba(127,178,255,${(.15 + z * .75) * fade})`;
      g.beginPath(); g.arc(x, y, (1 + z * 1.6) * dpr * lerp(1, .9, e), 0, 7); g.fill();
    }
    const at = mini && mini.at >= 0 ? Math.min(mini.at, HELLO.length - 1) : 0;
    const [x, y, z] = P(onSphere(HELLO[at][2], HELLO[at][3]));
    const show = false && e > .6 && z > .2;
    if (e > .6 && z > .2) { g.fillStyle = `rgba(255,255,255,${.7 * fade})`; g.beginPath(); g.arc(x, y, 3.5 * dpr, 0, 7); g.fill(); }
    hi.style.opacity = show ? Math.min(1, (e - .6) * 4) : 0;
    if (show) { hi.style.left = (x / dpr) + 'px'; hi.style.top = (y / dpr) + 'px'; if (hi.textContent !== HELLO[at][0]) hi.textContent = HELLO[at][0]; }
  };

  const trip = $('[data-trip]');
  const mini = trip && { c: $('[data-mini]', trip), pts: sphere(420), rot: 0, at: -1 };
  if (mini) { trip.hidden = false; fit(mini.c); mini.g = mini.c.getContext('2d'); }
  const drawMini = () => {
    const { c, g, pts } = mini, W = c.width;
    const [, , lat, lon] = HELLO[Math.max(0, mini.at) % HELLO.length];
    mini.rot += ((lon * RAD - Math.PI / 2) - mini.rot) * (still ? 1 : .08);
    const P = projector(W / 2, W / 2, W / 2 * .94, mini.rot, .45);
    g.clearRect(0, 0, W, W);
    g.fillStyle = '#0a0d22'; g.beginPath(); g.arc(W / 2, W / 2, W / 2, 0, 7); g.fill();
    for (const p of pts) {
      const [x, y, z] = P(p); if (z < 0) continue;
      g.fillStyle = `rgba(127,178,255,${.2 + z * .7})`; g.fillRect(x, y, dpr * 1.3, dpr * 1.3);
    }
    const [x, y, z] = P(onSphere(lat, lon));
    if (z > 0) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 3 * dpr, 0, 7); g.fill(); }
  };
  const updateTrip = () => {
    if (!mini) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    trip.classList.toggle('is-on', scrollY > innerHeight * .5);
    $('[data-trip-bar]', trip).style.strokeDashoffset = (207.3 * (1 - p)).toFixed(1);
    $('[data-trip-pct]', trip).textContent = Math.round(p * 100);
    const end = p > .96, at = end ? HELLO.length : Math.min(HELLO.length - 1, Math.floor(p * HELLO.length));
    if (at === mini.at) return;
    mini.at = at;
    trip.classList.toggle('is-end', end);
    $('[data-trip-word]', trip).textContent = end ? 'Your language?' : HELLO[at][0];
    $('[data-trip-lang]', trip).textContent = end ? 'Get a price' : HELLO[at][1];
    const say = $('.trip__say', trip); say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
  };
  addEventListener('scroll', updateTrip, { passive: true });
  updateTrip();

  const frame = (t) => {
    if (big && big.seen) drawPlanet(still ? 0 : t);
    if (mini && trip.classList.contains('is-on')) drawMini();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

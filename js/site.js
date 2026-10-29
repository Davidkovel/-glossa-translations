(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MAIL = 'lingvotranslate.agency@gmail.com';
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
  /* the request form posts to FormSubmit, which mails it (with the file) to our inbox.
     Only documents and pictures, up to 10 MB; anything else is refused here before it is sent. */
  const form = $('[data-form]');
  const OK_EXT = /\.(pdf|docx|xlsx|pptx|txt|srt|vtt|jpe?g|png)$/i, MAX = 5 * 1024 * 1024;
  const fileIn = $('[data-file-input]'), fileName = $('[data-file-name]'), fileErr = $('[data-file-err]');
  const checkFile = () => {
    const f = fileIn && fileIn.files[0];
    let err = '';
    if (f && !OK_EXT.test(f.name)) err = 'This file type is not accepted. Please send PDF, DOCX, XLSX, PPTX, TXT, SRT, JPG or PNG.';
    else if (f && f.size > MAX) err = 'The file is larger than 5 MB. Please send it in Telegram.';
    if (err) fileIn.value = '';
    fileErr.hidden = !err; fileErr.textContent = err;
    fileName.textContent = fileIn.files[0] ? fileIn.files[0].name : 'Attach a file';
    return !err;
  };
  /* the first bytes must match the type: a renamed program (.exe → .pdf) or a script is refused */
  const SIG = { pdf: ['25504446'], docx: ['504b0304'], xlsx: ['504b0304'], pptx: ['504b0304'], jpg: ['ffd8ff'], jpeg: ['ffd8ff'], png: ['89504e47'] };
  const sniff = (f) => f.slice(0, 8).arrayBuffer().then((b) => {
    const hex = [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
    const ext = f.name.split('.').pop().toLowerCase();
    if (SIG[ext]) return SIG[ext].some((s) => hex.startsWith(s));
    return !/^(4d5a|7f454c46|23212f|3c21|3c3f|3c73|3c68)/.test(hex); /* text files: no programs (MZ, ELF), scripts or HTML */
  });
  fileIn?.addEventListener('change', () => {
    if (!checkFile()) return;
    const f = fileIn.files[0];
    if (f) sniff(f).then((ok) => {
      if (ok) return;
      fileIn.value = ''; fileName.textContent = 'Attach a file';
      fileErr.hidden = false; fileErr.textContent = 'This file does not look like a real document or image. Please send another file.';
    });
  });

  /* every request also lands in our Telegram through the bot; the email post goes after it
     (or after 8 s, so a slow Telegram never holds the visitor back) */
  /* email copy of every request: Web3Forms (the access key is public by design, it only allows sending to our inbox) */
  const W3 = '4f8213ab-bc0a-4499-9ea2-d80a766fa23a';
  const web3 = (fields) => fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(Object.assign({ access_key: W3, subject: 'New request — Lingvo site', from_name: 'Lingvo site', replyto: fields.Email || '' }, fields)),
  }).catch(() => {});
  /* requests go to our Cloudflare Worker (worker/worker.js): it checks the file again and sends everything to Telegram.
     The bot key is a secret of the Worker, not in this file. */
  const API = 'https://lingvo-form.lingvotranslate-agency.workers.dev';
  const tell = (fields, file) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append('file', file, file.name);
    return fetch(API, { method: 'POST', body: fd });
  };
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkFile() || form.dataset.sending) return;
    const ff = fileIn && fileIn.files[0];
    if (ff && !form.dataset.sniffed) { sniff(ff).then((ok) => { if (ok) { form.dataset.sniffed = '1'; form.requestSubmit(); } else { fileIn.value = ''; checkFile(); fileErr.hidden = false; fileErr.textContent = 'This file does not look like a real document or image. Please send another file.'; } }); return; }
    form.dataset.sending = '1';
    const d = new FormData(form);
    const fields = {
      Name: d.get('name'), Email: d.get('email'), 'Phone / Telegram': d.get('phone'),
      Client: d.get('client'), Services: d.getAll('service').join(', '), 'Reply in': d.get('reply'), Request: d.get('text'),
    };
    const f = fileIn && fileIn.files[0];
    const mail = web3(fields);
    Promise.race([Promise.all([tell(fields, f).catch(() => {}), mail]), new Promise((r) => setTimeout(r, 8000))]).then(() => {
      form.innerHTML = '<div class="mx-thanks"><b>Thank you! Your request is in.</b><p>We reply within 15 minutes in working hours. Faster: <a href="https://wa.me/4367763178397">WhatsApp</a> or <a href="https://t.me/lingvo_translations">Telegram</a>.</p></div>';
    });
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
    const fields = { Email: new FormData(e.target).get('email'), Request: 'Price for a translation (exit form)' };
    tell(fields).catch(() => {});
    web3(fields);
    send(fields);
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
  let introSeen = null;
  try { introSeen = sessionStorage.getItem('lingvo-intro-2'); sessionStorage.setItem('lingvo-intro-2', '1'); } catch (_) {}
  const big = planet && { g: planet.getContext('2d'), pts: sphere(2200), seen: true, intro: !still && !introSeen && scrollY < 50, parts: [] };
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
    if (big.t0 == null) big.t0 = t;
    const it = t - big.t0, ip = big.intro ? smooth(Math.min(1, it / 1600)) : 1;
    const R = lerp(R0, R1, e), cx = lerp(W / 2, fx * W, e), cy = lerp(H * (phone ? .8 : .4) + R0, H * .54, e) + (1 - ip) * H * .55 * (1 - e);
    const at0 = mini && mini.at >= 0 ? Math.min(mini.at, HELLO.length - 1) : 0;
    const rotT = lerp(t / 50000 + scrollY * .0012, HELLO[at0][3] * RAD - Math.PI / 2, e);
    big.rot = big.rot == null || still ? rotT : big.rot + (rotT - big.rot) * .03;
    const rot = big.rot, tilt = lerp(-.5, .45, e);
    const P = projector(cx, cy, R, rot, tilt), fade = lerp(1, .24, e);
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
    /* first visit: greetings rise out of the planet and fade, for about three seconds */
    if (big.intro && e < .5 && !phone) {
      if (it > 700 && it < 3600 && it - (big.last || 0) > 170) {
        big.last = it;
        const side = Math.random() < .5 ? -1 : 1, sx = cx + side * (W * (.31 + Math.random() * .16)), dx = sx - cx;
        if (Math.abs(dx) < R && Math.abs(dx) > W * .3) big.parts.push({ w: HELLO[(Math.random() * HELLO.length) | 0][0], x: sx, y: cy - Math.sqrt(R * R - dx * dx), b: it, s: 15 + Math.random() * 10 });
      }
      big.parts = big.parts.filter((q) => it - q.b < 2200);
      for (const q of big.parts) {
        const k = (it - q.b) / 2200, a = k < .2 ? k / .2 : 1 - (k - .2) / .8;
        g.font = `700 ${q.s * dpr}px Manrope, system-ui, sans-serif`; g.textAlign = 'center';
        g.fillStyle = `rgba(200,222,255,${a * .95})`; g.fillText(q.w, q.x, q.y - 12 * dpr - k * 110 * dpr);
        g.fillStyle = `rgba(127,178,255,${a})`; g.beginPath(); g.arc(q.x, q.y - k * 30 * dpr, 2.5 * dpr, 0, 7); g.fill();
      }
      g.textAlign = 'start';
      if (it > 6000) big.intro = false;
    }
    const at = mini && mini.at >= 0 ? Math.min(mini.at, HELLO.length - 1) : 0;
    const [x, y, z] = P(onSphere(HELLO[at][2], HELLO[at][3]));
    const show = false && e > .6 && z > .2;
    if (e > .6 && z > .2) { g.fillStyle = `rgba(255,255,255,${.5 * fade})`; g.beginPath(); g.arc(x, y, 3.5 * dpr, 0, 7); g.fill(); }
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

  /* opening screen (first visit in a session): a turning globe, "hello" in one language after another,
     the name, then the page opens. About two seconds; a click, a key or the wheel skips it. */
  const intro = $('[data-intro]');
  if (intro && big && big.intro) {
    intro.hidden = false;
    const ic = $('[data-intro-globe]', intro), ig = ic.getContext('2d'), ipts = sphere(900), word = $('[data-intro-word]', intro);
    fit(ic);
    let n = 0, done = false;
    const swap = setInterval(() => { n = (n + 1) % HELLO.length; word.textContent = HELLO[n][0]; }, 130);
    const spin = (t) => {
      if (done) return;
      const W = ic.width, P = projector(W / 2, W / 2, W / 2 * .92, t / 900, .35);
      ig.clearRect(0, 0, W, W);
      for (const q of ipts) { const [x, y, z] = P(q); if (z < 0) continue; ig.fillStyle = `rgba(127,178,255,${.2 + z * .8})`; ig.fillRect(x, y, 1.6 * dpr, 1.6 * dpr); }
      requestAnimationFrame(spin);
    };
    requestAnimationFrame(spin);
    const close = () => {
      if (done) return; done = true; clearInterval(swap);
      word.textContent = 'Hello'; intro.classList.add('is-out');
      big.t0 = null;
      setTimeout(() => intro.remove(), 700);
    };
    setTimeout(() => { clearInterval(swap); word.textContent = 'Hello'; intro.classList.add('is-name'); }, 1500);
    setTimeout(close, 2300);
    ['click', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, close, { once: true, passive: true }));
  } else if (intro) intro.remove();

  const frame = (t) => {

    if (big && big.seen) drawPlanet(still ? 0 : t);
    if (mini && trip.classList.contains('is-on')) drawMini();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);


  /* phone: a «Get a price» button stays under the thumb after the first screen, and steps aside at the form */
  const mcta = $('[data-mcta]'), priceSec = $('#price');
  if (mcta && priceSec) {
    let atForm = false;
    new IntersectionObserver(([en]) => { atForm = en.isIntersecting; tog(); }, { threshold: .05 }).observe(priceSec);
    const tog = () => mcta.classList.toggle('is-on', scrollY > innerHeight * .8 && !atForm);
    addEventListener('scroll', tog, { passive: true }); tog();
  }
})();
/* a service page links here with ?service=…: tick that service in the form */
(() => {
  const s = new URLSearchParams(location.search).get('service');
  if (!s) return;
  const c = document.querySelector(`.chips input[value="${CSS.escape(s)}"]`);
  if (c) c.checked = true;
})();

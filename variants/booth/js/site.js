// Versio — the delegate console: two channel dials, the booths they light, the price request.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const booths = $$('button.booth');
  const LANGS = booths.map((b) => ({ ch: +b.dataset.ch, code: b.dataset.code, name: b.dataset.name }));
  const N = LANGS.length, SWEEP = 270, START = -135;
  const angleOf = (i) => START + (SWEEP / (N - 1)) * i;          // i: 0..N-1
  const state = { from: 1, to: 2 };                                 // indexes: UA → DE

  /* ---------- dials ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const dials = {};
  $$('[data-dial]').forEach((el) => {
    const g = $('.dial__ticks', el);
    LANGS.forEach((l, i) => {
      const a = (angleOf(i) - 90) * Math.PI / 180;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', 60 + Math.cos(a) * 41); line.setAttribute('y1', 60 + Math.sin(a) * 41);
      line.setAttribute('x2', 60 + Math.cos(a) * 47); line.setAttribute('y2', 60 + Math.sin(a) * 47);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', 60 + Math.cos(a) * 56); t.setAttribute('y', 60 + Math.sin(a) * 56);
      t.textContent = l.code;
      g.append(line, t);
    });
    dials[el.dataset.dial] = { el, knob: $('.dial__knob', el), lines: $$('line', g), labels: $$('text', g) };

    const set = (i) => { state[el.dataset.dial] = Math.max(0, Math.min(N - 1, i)); paint(); };
    const fromPointer = (e) => {
      const r = el.getBoundingClientRect();
      let deg = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
      if (deg > 180) deg -= 360;
      set(Math.round((Math.max(START, Math.min(-START, deg)) - START) / (SWEEP / (N - 1))));
    };
    el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); fromPointer(e); });
    el.addEventListener('pointermove', (e) => { if (el.hasPointerCapture(e.pointerId)) fromPointer(e); });
    el.addEventListener('wheel', (e) => { e.preventDefault(); set(state[el.dataset.dial] + (e.deltaY > 0 ? 1 : -1)); }, { passive: false });
    el.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (k) { e.preventDefault(); set(state[el.dataset.dial] + k); }
      if (e.key === 'Home') { e.preventDefault(); set(0); }
      if (e.key === 'End') { e.preventDefault(); set(N - 1); }
    });
  });

  /* a booth is a shortcut for the "into" dial */
  booths.forEach((b, i) => b.addEventListener('click', () => { state.to = i; paint(); }));

  /* ---------- service keys and the channel card ---------- */
  const form = $('[data-form]');
  const lcd = $('.lcd'), lcdPair = $('[data-lcd-pair]'), lcdSvc = $('[data-lcd-svc]');
  const service = () => new FormData(form).get('service');
  form.addEventListener('change', (e) => { if (e.target.name === 'service') paint(); });
  $$('[data-svc]').forEach((b) => b.addEventListener('click', () => {
    const r = $(`input[name=service][value="${b.dataset.svc}"]`, form);
    if (r) r.checked = true;
    paint();
    $('#console').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    lcd.classList.add('blink'); setTimeout(() => lcd.classList.remove('blink'), 700);
  }));

  function paint() {
    for (const key of ['from', 'to']) {
      const d = dials[key], i = state[key], l = LANGS[i];
      d.knob.style.transform = `rotate(${angleOf(i)}deg)`;
      d.lines.forEach((x, j) => x.classList.toggle('on', j === i));
      d.labels.forEach((x, j) => x.classList.toggle('on', j === i));
      d.el.setAttribute('aria-valuenow', l.ch);
      d.el.setAttribute('aria-valuetext', l.name);
      $(`[data-${key}-name]`).textContent = l.name;
    }
    booths.forEach((b, j) => {
      b.classList.toggle('is-to', j === state.to);
      b.classList.toggle('is-from', j === state.from && j !== state.to);
      b.setAttribute('aria-pressed', String(j === state.to));
    });
    lcdPair.textContent = `${LANGS[state.from].code} → ${LANGS[state.to].code}`;
    lcdSvc.textContent = service();
  }
  paint();

  /* ---------- the request: the drawer opens inside the console ---------- */
  const drawer = $('#drawer'), open = $('[data-open]');
  open.addEventListener('click', () => {
    drawer.hidden = false; open.setAttribute('aria-expanded', 'true');
    $('input[name=name]', drawer).focus();
  });
  const MAIL = 'hi@versio-translations.com';
  const send = (fields) => {
    const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Price request')}&body=${encodeURIComponent(body)}`;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    send({ Pair: `${LANGS[state.from].name} → ${LANGS[state.to].name}`, Service: d.get('service'),
      Name: d.get('name'), Email: d.get('email'), Contact: d.get('phone'), Text: d.get('text') });
    $('[data-ok]').hidden = false; sent = true;
  });

  /* ---------- the one number counts once ---------- */
  const n = $('[data-count]');
  if (n && !calm) {
    const to = +n.dataset.count;
    new IntersectionObserver(([en], io) => {
      if (!en.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1300);
        n.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(n);
  }

  /* ---------- leaving note, once per visit, never over the form ---------- */
  const leave = $('[data-leave]');
  let sent = false, shown = sessionStorage.getItem('versio-leave');
  const show = () => { if (shown || sent) return; shown = '1'; sessionStorage.setItem('versio-leave', '1'); leave.hidden = false; };
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8 && scrollY > 600) show(); });
  if (matchMedia('(max-width: 760px)').matches) setTimeout(() => { if (scrollY > 1200) show(); }, 45000);
  $('[data-leave-x]').addEventListener('click', () => { leave.hidden = true; });
  $('[data-leave-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    send({ Email: new FormData(e.target).get('email'), Request: 'A price for a translation' });
    leave.hidden = true;
  });
})();

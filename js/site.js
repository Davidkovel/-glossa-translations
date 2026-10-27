(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MAIL = 'hi@versio-translations.com';
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

  const trip = $('[data-trip]');
  if (trip) seen($('.paper', trip), () => {
    if (still) { trip.dataset.step = 4; return; }
    [500, 1500, 2500, 3500].forEach((t, i) => setTimeout(() => { trip.dataset.step = i + 1; }, t));
  });

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
      Client: d.get('client'),
      Services: d.getAll('service').join(', '),
      Name: d.get('name'),
      Email: d.get('email'),
      Phone: d.get('phone'),
      Request: d.get('text'),
    });
    $('[data-ok]').hidden = false;
  });

  /* exit intent: once per visit */
  const exit = $('[data-exit]');
  let shown = null;
  try { shown = sessionStorage.getItem('versio-exit'); } catch (_) {}
  const open = () => {
    if (shown) return;
    shown = '1';
    try { sessionStorage.setItem('versio-exit', '1'); } catch (_) {}
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
})();

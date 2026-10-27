// Versio — floating documents, counters, rings, the order panel, forms. No scroll-jacking.
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 600px)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* logo strip: two copies for a seamless loop */
  $$('[data-faixa] > div').forEach((el) => { el.innerHTML += el.innerHTML; });

  /* hero documents drift a little with the mouse (desktop only) */
  const hero = $('[data-hero]');
  const docs = $$('.fd[data-depth]');
  if (hero && !calm && matchMedia('(min-width: 901px) and (pointer: fine)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      docs.forEach((d) => {
        const k = +d.dataset.depth;
        d.style.setProperty('--px', (x * k).toFixed(1) + 'px');
        d.style.setProperty('--py', (y * k).toFixed(1) + 'px');
      });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    });
  }

  /* "For business" / "For private clients" preselect the form */
  $$('[data-client]').forEach((a) => a.addEventListener('click', () => {
    const r = $(`input[name=client][value=${a.dataset.client}]`); if (r) r.checked = true;
  }));

  /* sections rise in once */
  if (!calm) {
    const items = $$('.nums, .ring, .svc, .price__card, .panel, .steps li, .case, .coupon__box, .faq__list');
    items.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, sib = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* counters */
  const fmt = (v, sep) => (sep ? Math.round(v).toLocaleString('en-US') : String(Math.round(v)));
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  if (!calm) {
    const run = (el) => {
      const to = +el.dataset.conta, sep = 'sep' in el.dataset, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1400);
        el.textContent = fmt(to * ease(p), sep);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.6 });
    $$('[data-conta]').forEach((el) => io.observe(el));
  }

  /* rings: fill to their percent once, the number counts with them */
  const CIRC = 326.7;
  $$('[data-ring]').forEach((fig) => {
    const to = +fig.dataset.ring, fg = $('.ring__fg', fig), n = $('[data-ring-n]', fig);
    const show = () => {
      fg.style.strokeDashoffset = String(CIRC * (1 - to / 100));
      if (!n || calm) return;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1600);
        n.textContent = Math.round(to * ease(p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    new IntersectionObserver((ens, io) => {
      if (ens[0].isIntersecting) { show(); io.disconnect(); }
    }, { threshold: 0.5 }).observe(fig);
  });

  /* order panel: the file goes translator → editor → proofreader → delivered, then again */
  const panel = $('[data-panel]');
  if (panel) {
    const bar = $('[data-bar]', panel), pct = $('[data-pct]', panel), done = $('[data-done]', panel);
    const rows = $$('[data-step]', panel);
    const LABEL = [['Translating…', 'Done'], ['Editing…', 'Done'], ['Reading…', 'Done']];
    const RUN = 9000, HOLD = 2600;
    let t0 = 0, seen = false, raf = 0, last = -1;
    const paint = (p) => {
      const v = Math.round(p * 100);
      if (v === last) return; last = v;
      bar.style.width = v + '%'; pct.textContent = v;
      rows.forEach((r, i) => {
        const a = i / 3, b = (i + 1) / 3;
        r.classList.toggle('on', p >= a && p < b);
        r.classList.toggle('ok', p >= b);
        $('em', r).textContent = p >= b ? LABEL[i][1] : p >= a ? LABEL[i][0] : 'Waiting';
      });
      done.classList.toggle('on', p >= 1);
    };
    const loop = (now) => {
      if (!t0) t0 = now;
      paint(Math.min(1, ((now - t0) % (RUN + HOLD)) / RUN));
      raf = seen ? requestAnimationFrame(loop) : 0;
    };
    if (calm) paint(1);
    else new IntersectionObserver(([en]) => {
      seen = en.isIntersecting;
      if (seen && !raf) raf = requestAnimationFrame(loop);
    }, { threshold: 0.3 }).observe(panel);
  }

  /* forms: no backend yet, the request opens in the mail app */
  const MAIL = 'hi@versio-translations.com';
  function send(fields) {
    const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => k + ': ' + v).join('\n');
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Quote request') + '&body=' + encodeURIComponent(body);
  }
  const form = $('[data-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    send({ Client: d.get('client'), Service: d.getAll('service').join(', '), Name: d.get('name'), Email: d.get('email'), Contact: d.get('phone'), Request: d.get('text') });
    $('[data-ok]').hidden = false;
  });

  /* exit intent: once per visit */
  const exit = $('[data-exit]');
  let shown = sessionStorage.getItem('versio-exit');
  const open = () => { if (shown) return; shown = '1'; sessionStorage.setItem('versio-exit', '1'); exit.hidden = false; };
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8 && scrollY > 400) open(); });
  if (phone) setTimeout(() => { if (scrollY > 1200) open(); }, 45000);
  $('[data-exit-close]')?.addEventListener('click', () => { exit.hidden = true; });
  exit?.addEventListener('click', (e) => { if (e.target === exit) exit.hidden = true; });
  $('[data-exit-form]')?.addEventListener('submit', (e) => {
    e.preventDefault(); send({ Email: new FormData(e.target).get('email'), Request: 'Price for a translation (exit form)' }); exit.hidden = true;
  });
})();

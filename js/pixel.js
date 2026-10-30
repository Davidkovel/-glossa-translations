/* Meta Pixel: PageView, Lead on a sent form (site.js), Contact on a WhatsApp/Telegram click.
   European visitors get it only after they accept the cookie bar. */
(() => {
  const ID = '990429120133537';
  const KEY = 'lingvo-cookies';
  const load = () => {
    if (window.fbq) return;
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const s = document.createElement('script');
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    n('init', ID);
    n('track', 'PageView');
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest?.('a[href*="wa.me/"], a[href*="t.me/"]')) window.fbq?.('track', 'Contact');
  });
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (saved === 'yes' || (!saved && !tz.startsWith('Europe/'))) return load();
  if (saved) return;
  const bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookies');
  bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:520px;margin:0 auto;padding:16px 18px;border-radius:14px;background:#10131f;color:#fff;font:15px/1.5 Manrope,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)';
  bar.innerHTML = '<p style="margin:0 0 12px">We use advertising cookies from Meta to measure our ads. See the <a href="privacy.html" style="color:inherit">privacy policy</a>.</p>'
    + '<button data-c="yes" style="margin-right:8px">Accept</button><button data-c="no">Decline</button>';
  bar.querySelectorAll('button').forEach((b) => {
    b.style.cssText = 'padding:9px 18px;border:1px solid #fff;border-radius:999px;background:none;color:#fff;font:inherit;font-weight:700;cursor:pointer';
    if (b.dataset.c === 'yes') b.style.marginRight = '8px';
    b.addEventListener('click', () => {
      try { localStorage.setItem(KEY, b.dataset.c); } catch (_) {}
      bar.remove();
      if (b.dataset.c === 'yes') load();
    });
  });
  document.body.appendChild(bar);
})();

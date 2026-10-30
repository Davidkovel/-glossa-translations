/* a visitor in a US time zone sees the starting prices in dollars */
(() => {
  const US = /^America\/(New_York|Detroit|Chicago|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak|Menominee|(Indiana|Kentucky|North_Dakota)\/.+)$|^Pacific\/Honolulu$/;
  const RATE = 1.16;
  if (!US.test(Intl.DateTimeFormat().resolvedOptions().timeZone || '')) return;
  document.querySelectorAll('.mx-case strong').forEach(el => {
    el.textContent = el.textContent.replace(/€([\d.]+)/, (_, n) => {
      const usd = n * RATE;
      return '$' + (usd && usd < 1 ? usd.toFixed(2) : Math.round(usd));
    });
  });
})();

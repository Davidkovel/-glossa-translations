# Lingvo Translations — сайт переводческого агентства

Одностраничный сайт агентства переводов и локализации. Чистый HTML + CSS + JS, без сборки и без npm.

- **Живой сайт:** https://lingvotranslations.website/ (GitHub Pages, ветка `main`, корень)
- **Локально:** `start.bat` → http://localhost:8797/
- **Обновить сайт:** правка → `git commit` → `git push`, через ~1 минуту изменения на GitHub Pages

## Файлы

| Файл | Что внутри |
|---|---|
| `index.html` | вся страница |
| `css/site.css` | все стили; блок «phone layout» и мобильные правки стоят **в конце файла** — так они главнее настольных |
| `js/site.js` | заставка, планета на фоне, глобус-прогресс в углу, вкладки отраслей, форма, кнопка «Get a price» на телефоне |
| `img/` | логотипы клиентов, фото паспорта, `og.png` (превью ссылки 1200×630) |
| `privacy.html` | политика конфиденциальности |
| `PRODUCT.md` | факты о компании, которые можно писать на сайте |
| `variants/` | прошлые версии и галерея 16 вариантов первого экрана (`variants/looks/gallery.html`) |

После любой правки CSS или JS поднимите номер `?v=` в `index.html` (`site.css?v=46` → `?v=47`), иначе телефоны покажут старую версию из кэша.

## Страница сверху вниз

1. **Заставка** (первый заход за сеанс, ~2 с): глобус, «Hello» на разных языках, «Lingvo translations».
2. **Первый экран:** «Translations into every language», языки, кнопки, строка доверия, цифры; под текстом поднимается планета из точек, внизу подсказка «Scroll».
3. **Логотипы клиентов** — бегущая лента.
4. **What we do** — Translation / Localization / Copywriting; картинки понятны без знания языков.
5. **Everything we translate** — 9 услуг.
6. **120+ languages** — лента языков.
7. **Industries we work with** — казино, ставки, криптобиржи, банки и кредиты, такси и приложения.
8. **How we start + Quick request** — 3 шага и форма заявки (как у MK Translations).
9. **FAQ** и **футер**.

Правило картинок: если в макете есть фраза на другом языке, под ней мелко стоит английский оригинал `EN · …`.

## Форма заявки и файлы

Форма отправляется через [FormSubmit](https://formsubmit.co) на почту из атрибута `action` в `index.html`.
Сейчас там **заглушка** `hi@lingvo-translations.com`, поэтому заявки не доходят. Чтобы включить:

1. заменить адрес в `action="https://formsubmit.co/…"` на настоящую почту;
2. отправить одну тестовую заявку и нажать «Activate» в письме от FormSubmit.

Файлы: только PDF, Word, Excel, PowerPoint, TXT, SRT/VTT, JPG/PNG, до 10 МБ — остальное сайт не пропускает. Большие файлы — через Telegram.

## Что ещё нужно перед запуском

- настоящая почта для формы и настоящий Telegram (сейчас `t.me/lingvo_translations` — заглушка);
- свой домен вместо github.io;
- убрать `<meta name="robots" content="noindex">`, когда сайт готов для Google;
- настоящие работы и отзывы клиентов вместо примеров в разделе отраслей;
- переписать `privacy.html` под Lingvo и приём файлов.

## Цвета и шрифт

Фон `#05060f`, текст `#f2f4ff`, акцент `#7fb2ff`, кнопки белые. Шрифт Manrope (Google Fonts).
Логотип — слово «Lingv» + глобус вместо «o» + «translations» (символ `#globe-o` в `index.html`).

## Sales blocks draft (29.10.2026) — waiting for approval

Built from a competitor analysis (mk-translations.ua) and the questions: who buys, what pain, how we solve it, why us, how to buy.
Method: skill `site-que-vende` in team-agent/library/skills.

Preview: run `start.bat`, then open http://localhost:8797/
- Hero: "Translations accepted the first time", for companies and people moving abroad, free redo guarantee, two buttons (business / private).
- `#pain` — "Sound familiar?": visa refused, deadline missed, word-for-word text.
- `#cases` — "What a typical job looks like": 3 typical orders (what we can do, no invented clients or quotes). Swap for real cases when we have them.
- `#why` — table: freelancer vs typical agency vs Lingvo.
- FAQ: + "What if the embassy or court rejects it?", + "Why not a cheaper freelancer?"

Open questions: real cases/testimonials; is the free-redo guarantee OK.
Backup of the previous page: `index.backup-2910.html`. Not pushed yet.

## Launch checklist (SEO) — do this on launch day

Prepared on 29.10.2026.

1. ~~Remove `noindex`~~ — done 29.10.2026, the site is open to Google.
2. **Domain**: if we buy one, put it in Settings → Pages → Custom domain, then replace `https://lingvotranslations.website/` with it in: canonical/og:url and JSON-LD of the 4 pages, `robots.txt`, `sitemap.xml`, `og:image`.
3. **Google Search Console**: add the site, verify, submit `sitemap.xml`, request indexing of the 4 pages.
4. **Google Business Profile** (Google Maps), only if we have an address clients can visit or a service area.
5. **Check**: Rich Results Test on each page (schema: ProfessionalService, FAQPage, Service with prices, BreadcrumbList), PageSpeed Insights on mobile.
6. **Real reviews** → add a reviews block back (and `aggregateRating` only with real Google reviews).
7. Telegram bot key is public in `js/site.js` → move sending to a Cloudflare Worker.

Already done: titles and descriptions per page, canonical, og tags, JSON-LD schema, `robots.txt`, `sitemap.xml`, 3 service pages for search («certified translation for visa», «legal translation», «website and app localization»).

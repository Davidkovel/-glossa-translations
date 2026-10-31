"""Builds keyword landing pages from birth-certificate-translation.html (the template).
Run: python _seo_pages.py   (re-runnable; also refreshes footer links and sitemap)."""
import json, re, pathlib, datetime

ROOT = pathlib.Path(__file__).parent
SITE = "https://lingvotranslations.website/"
TPL = (ROOT / "birth-certificate-translation.html").read_text(encoding="utf-8")
CTA = "index.html?service=Certified%20documents#price"

PAGES = [
 dict(slug="marriage-certificate-translation", short="Marriage certificate translation",
  title="Certified marriage certificate translation for USCIS, UK visa and residence",
  desc="Certified marriage certificate translation for USCIS, UK spouse visa, IRCC and residence permits in Europe. From €25, same day possible.",
  h1="Marriage certificate translation", h1b="for USCIS, UK visa and residence",
  lead="For green card and K-1, UK spouse visa, Canada PR, family reunion and name change abroad. Translated, signed and certified — names exactly as in your passports.",
  risks=[("Names do not match passports","Two spouses, maiden name, patronymic — one letter off and the officer asks for a new translation."),
         ("Stamps and notes left out","USCIS and UKVI want a complete translation: every stamp, seal and handwritten note."),
         ("No translator statement","Without a signed statement of accuracy and competence the translation is not accepted.")],
  price=("Marriage certificate","from €25","certified, one document"),
  faq=[("Is it accepted by USCIS?","Yes. USCIS asks for a full English translation with the translator's certification that it is complete and accurate and that the translator is competent in both languages — that is exactly what we provide."),
       ("Do I need it notarized?","Not for USCIS or UKVI. If an office in your country wants a notary or apostille, tell us and we arrange it."),
       ("Can you translate both spouses' names correctly?","Yes. Send both passports with the certificate and we copy the Latin spelling from them."),
       ("Which languages?","Ukrainian, Russian, Polish, Spanish, Arabic, Turkish, Chinese and 120+ more, into English, German and other languages.")]),
 dict(slug="police-certificate-translation", short="Police certificate translation",
  title="Police certificate translation for IRCC, UKVI and USCIS — certified",
  desc="Certified translation of police clearance certificates for Canada (IRCC), UK visas, USCIS and work permits in Europe. From €25, ready the same day.",
  h1="Police certificate translation", h1b="for IRCC, UKVI and USCIS",
  lead="Police clearance, criminal record extract or certificate of no criminal record — translated and certified for Canada PR, UK visa, green card and work permits.",
  risks=[("Certificate expires while you wait","Police certificates are valid for a short time. A slow translation can cost you a new certificate."),
         ("IRCC rejects the translation","Canada wants a certified translator or a translator's affidavit — a plain translation is sent back."),
         ("Wrong name order","Name, date and place of birth must match your passport word for word.")],
  price=("Police certificate","from €25","certified, one document"),
  faq=[("Is it accepted by IRCC (Canada)?","IRCC accepts a translation by a certified translator, or a translation with an affidavit from the translator. Tell us it is for IRCC and we prepare it in the form IRCC asks for."),
       ("How fast?","Usually the same day. A one-page certificate often takes a few hours."),
       ("Is it fine for UK visa?","Yes. UKVI wants the translator's confirmation that it is accurate, the date, the translator's full name, signature and contact details — all included."),
       ("Do I need the original?","A clear scan or photo is enough. The office gets your original certificate plus our translation.")]),
 dict(slug="bank-statement-translation", short="Bank statement translation",
  title="Bank statement translation for UK visa and immigration — certified",
  desc="Certified bank statement translation for UK visa financial evidence, Schengen visa, USCIS and residence permits. Tables, amounts and stamps kept. From €25.",
  h1="Bank statement translation", h1b="for UK visa and immigration",
  lead="Bank statements, salary slips and savings letters for visa financial evidence. Every table, amount and bank stamp kept in place, certified for UKVI, embassies and migration offices.",
  risks=[("Amounts and dates mixed up","One wrong figure in the balance and the financial evidence fails."),
         ("Only part translated","UKVI and embassies want the full statement translated, not a summary."),
         ("Missing translator details","UKVI needs the translator's statement, date, full name, signature and contact details.")],
  price=("Bank statement","from €25","per document, up to 3 pages"),
  faq=[("Is it accepted for UK visa?","Yes. Each translation carries the confirmation of accuracy, date, the translator's full name, signature and contact details, as UKVI asks."),
       ("I have 6 months of statements. How is it priced?","We give one fixed price for the whole set in 15 minutes. Long statements cost less per page."),
       ("Do you keep the table layout?","Yes. Dates, descriptions and amounts stay in the same columns as in the original."),
       ("Is my data safe?","We use your file only for the translation and delete it after the order on request.")]),
 dict(slug="divorce-certificate-translation", short="Divorce certificate translation",
  title="Divorce certificate and divorce decree translation — certified",
  desc="Certified translation of divorce certificates and divorce decrees for remarriage abroad, USCIS, visas and name change. From €25, same day possible.",
  h1="Divorce certificate translation", h1b="and divorce decree, certified",
  lead="Divorce certificate, court decree or registry extract — for marriage abroad, green card, residence permit or going back to your maiden name.",
  risks=[("Court terms translated loosely","A decree is a legal text. Loose wording changes who got what — the office asks for a new one."),
         ("Missing case number or court stamp","Every number, date and stamp has to be in the translation."),
         ("Name does not match","Before and after the divorce — both names must match your documents.")],
  price=("Divorce certificate","from €25","certified, one document"),
  faq=[("Do you translate full court decrees?","Yes, decrees of any length. We fix the price for the whole decree in 15 minutes."),
       ("Is it accepted by USCIS?","Yes: a complete English translation with the translator's certification of accuracy and competence."),
       ("I need it to marry abroad. Do I need an apostille?","Often yes, on the original. We tell you what your country's registry office asks for and can translate the apostille too."),
       ("Which languages?","Ukrainian, Russian, Polish, Spanish, Arabic, Turkish and 120+ more.")]),
 dict(slug="apostille-translation", short="Apostille translation",
  title="Apostille translation — certified translation of documents with apostille",
  desc="Certified translation of documents with an apostille, the apostille stamp included. For visa, citizenship, marriage and residence abroad. From €25.",
  h1="Apostille translation", h1b="document and stamp, certified",
  lead="Birth and marriage certificates, diplomas, court papers with an apostille — we translate the document and the apostille itself, so the office gets one complete certified translation.",
  risks=[("Apostille left untranslated","Many offices want the apostille translated too. Without it the papers come back."),
         ("Wrong order of steps","In some countries the apostille goes on first and the translation after — or the other way round."),
         ("Translation not certified","A plain translation of an apostilled document is not accepted.")],
  price=("Document + apostille","from €25","certified, one document"),
  faq=[("Do you issue the apostille?","No — an apostille is issued by the authority in the country where the document was made. We translate the document and the apostille, and tell you the right order for your case."),
       ("Do I need the apostille translated?","Usually yes, when the country you submit to has another language. We include it in the price."),
       ("Which countries?","Any country of the Hague Apostille Convention — Ukraine, Poland, Austria, Germany, Spain, the US and others."),
       ("How fast?","Same day for most one-page documents.")]),
 dict(slug="russian-document-translation", short="Russian document translation",
  title="Russian document translation — certified, into English, German and more",
  desc="Certified translation of Russian documents: birth and marriage certificates, diplomas, passports, court papers. Into English, German and 120+ languages. From €25.",
  h1="Russian document translation", h1b="certified, same day",
  lead="Russian and Soviet-era certificates, diplomas, passports, court decisions and contracts — translated by native speakers and certified for embassies, USCIS, UKVI and European offices.",
  risks=[("Transliteration differs from passport","Russian names have several spellings. We take yours from the passport."),
         ("Soviet forms and handwriting","Old stamps and handwritten entries a machine cannot read."),
         ("Patronymic dropped or mixed up","The office compares every part of the name.")],
  price=("Russian document","from €25","certified, one document"),
  faq=[("Into which languages?","English, German, Polish, Czech, Spanish, French, Italian and 120+ more."),
       ("Is it accepted by USCIS and UKVI?","Yes — a complete translation with the translator's signed statement of accuracy."),
       ("Do you translate Soviet-era documents?","Yes, including handwritten entries and old stamps."),
       ("Do I need the original?","A clear photo or scan is enough to start.")]),
]

def ld(p):
    url = SITE + p["slug"] + ".html"
    org = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', TPL).group(1))["@graph"][0]
    return json.dumps({"@context": "https://schema.org", "@graph": [org,
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]},
        {"@type": "Service", "name": p["short"], "provider": {"@id": SITE + "#org"}, "areaServed": "Worldwide", "url": url,
         "offers": [{"@type": "Offer", "name": p["price"][0], "priceCurrency": "EUR", "price": "25"}]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
                                                        {"@type": "ListItem", "position": 2, "name": p["short"], "item": url}]}]}, ensure_ascii=False)

def main_html(p):
    risks = "".join(f'<div class="mx-card"><span class="ico">✕</span><b>{b}</b><p>{t}</p></div>' for b, t in p["risks"])
    faq = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in p["faq"])
    n, pr, sub = p["price"]
    return f'''<main>
  <section class="mx" style="padding-top:150px;text-align:center">
    <p style="color:var(--sky);font-weight:700">Lingvo Translations</p>
    <h1 class="kicker" style="font-size:clamp(36px,5.4vw,72px);margin-top:12px">{p["h1"]}<br><span style="color:var(--sky)">{p["h1b"]}</span></h1>
    <p class="mx-sub" style="font-size:19px">{p["lead"]}</p>
    <p style="margin-top:30px"><a class="btn btn--brand btn--lg" href="{CTA}">Price in 15 minutes <span class="arr" aria-hidden="true"></span></a></p>
  </section>
  <section class="mx"><h2 class="kicker">What goes wrong without a good translator</h2><div class="mx-grid">{risks}</div></section>
  <section class="mx"><h2 class="kicker">How it works</h2><div class="mx-grid"><div class="mx-case"><small>Step 1</small><strong style="font-size:28px">Send a photo</strong><p>A photo or scan in WhatsApp, Telegram or the form.</p></div><div class="mx-case"><small>Step 2</small><strong style="font-size:28px">Fixed price</strong><p>Price and ready time in 15 minutes.</p></div><div class="mx-case"><small>Step 3</small><strong style="font-size:28px">Ready to submit</strong><p>Signed and certified, by email or courier.</p></div></div></section>
  <section class="mx"><h2 class="kicker">Prices</h2><p class="mx-sub">Starting prices; the exact one is fixed in 15 minutes. −10% on the first order.</p><div class="mx-grid"><div class="mx-case"><small>{n}</small><strong>{pr}</strong><p>{sub}</p></div><div class="mx-case"><small>Same day</small><strong>+50%</strong><p>when the appointment is close</p></div><div class="mx-case"><small>Free redo</small><strong>€0</strong><p>if the office rejects our translation</p></div></div></section>
  <section class="faq mx"><h2 class="kicker">Questions</h2><div class="faq__list">{faq}</div></section>
  <section class="mx" style="text-align:center"><h2 class="kicker">Send the file — get the price</h2><p style="margin-top:26px"><a class="btn btn--brand btn--lg" href="{CTA}">Get a price <span class="arr" aria-hidden="true"></span></a> <a class="btn btn--line btn--lg" href="https://wa.me/4367763178397">WhatsApp</a> <a class="btn btn--line btn--lg" href="https://t.me/lingvo_translations">Telegram</a></p></section>
</main>'''

def build(p):
    h = TPL
    old_url = SITE + "birth-certificate-translation.html"
    h = h.replace(old_url, SITE + p["slug"] + ".html")
    h = re.sub(r"<title>.*?</title>", f"<title>{p['title']} — Lingvo Translations</title>", h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + p["title"] + " — Lingvo Translations", h)
    h = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*', lambda m: m.group(1) + p["desc"], h)
    h = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: f'<script type="application/ld+json">{ld(p)}</script>', h, flags=re.S)
    h = re.sub(r"<main>.*?</main>", lambda m: main_html(p), h, flags=re.S)
    (ROOT / (p["slug"] + ".html")).write_text(h, encoding="utf-8")

for p in PAGES:
    build(p)

# footer links on every page + sitemap
extra = "".join(f' · <a href="{p["slug"]}.html">{p["short"]}</a>' for p in PAGES)
anchor = '<a href="ukrainian-document-translation.html">Ukrainian document translation</a>'
for f in ROOT.glob("*.html"):
    if f.name.startswith(("index.backup", "google")): continue
    s = f.read_text(encoding="utf-8")
    s = re.sub(r'(?: · <a href="(?:%s)\.html">[^<]*</a>)+' % "|".join(p["slug"] for p in PAGES), "", s)
    if anchor in s:
        f.write_text(s.replace(anchor, anchor + extra), encoding="utf-8")

sm = ROOT / "sitemap.xml"
s = sm.read_text(encoding="utf-8")
today = datetime.date.today().isoformat()
for p in PAGES:
    loc = f"{SITE}{p['slug']}.html"
    if loc not in s:
        s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod></url>\n</urlset>")
sm.write_text(s, encoding="utf-8")
print("ok", len(PAGES))

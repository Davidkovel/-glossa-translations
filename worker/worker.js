/* Lingvo form relay (Cloudflare Worker).
   The site posts the request here; the Worker checks the file and sends everything to our Telegram bot.
   The bot key lives only in the Worker's secrets (TG_TOKEN, TG_CHAT), never in the site's code. */

const ORIGINS = ['https://lingvotranslations.website', 'https://www.lingvotranslations.website', 'https://davidkovel.github.io', 'http://localhost:8797'];
const MAX = 5 * 1024 * 1024;
const SIG = { pdf: ['25504446'], docx: ['504b0304'], xlsx: ['504b0304'], pptx: ['504b0304'], jpg: ['ffd8ff'], jpeg: ['ffd8ff'], png: ['89504e47'] };
const TEXT = ['txt', 'srt', 'vtt'];
const BAD_TEXT = /^(4d5a|7f454c46|23212f|3c21|3c3f|3c73|3c68)/; // programs (MZ, ELF), scripts, HTML

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
});
const reply = (origin, status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });

async function fileOk(file) {
  if (file.size > MAX) return 'The file is larger than 5 MB.';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!SIG[ext] && !TEXT.includes(ext)) return 'This file type is not accepted.';
  const hex = [...new Uint8Array(await file.slice(0, 8).arrayBuffer())].map((x) => x.toString(16).padStart(2, '0')).join('');
  if (SIG[ext] ? !SIG[ext].some((s) => hex.startsWith(s)) : BAD_TEXT.test(hex)) return 'This file does not look like a real document or image.';
  return '';
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false });
    if (!ORIGINS.includes(origin)) return reply(origin, 403, { ok: false });

    let form;
    try { form = await req.formData(); } catch { return reply(origin, 400, { ok: false }); }
    if (form.get('website')) return reply(origin, 200, { ok: true }); // honeypot: bots fill hidden fields

    const fields = {};
    for (const [k, v] of form.entries()) if (k !== 'file' && typeof v === 'string' && v.trim()) fields[k] = v.trim().slice(0, 3000);
    if (!Object.keys(fields).length) return reply(origin, 400, { ok: false });

    const file = form.get('file');
    const hasFile = file && typeof file === 'object' && file.size > 0;
    if (hasFile) {
      const err = await fileOk(file);
      if (err) return reply(origin, 400, { ok: false, error: err });
    }

    const tg = 'https://api.telegram.org/bot' + env.TG_TOKEN + '/';
    const text = '🆕 New client — Lingvo site\n\n' + Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n');
    const r = await fetch(tg + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: env.TG_CHAT, text: text.slice(0, 4000) }) });
    if (hasFile) {
      const fd = new FormData();
      fd.append('chat_id', env.TG_CHAT);
      fd.append('document', file, file.name);
      fd.append('caption', 'File from ' + (fields.Name || fields.Email || 'the site'));
      await fetch(tg + 'sendDocument', { method: 'POST', body: fd });
    }
    return reply(origin, r.ok ? 200 : 502, { ok: r.ok });
  },
};

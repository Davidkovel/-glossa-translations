/* Lingvo site -> Telegram relay (Google Apps Script, run under the agency Gmail).
   The bot token and chat id live in Project Settings -> Script properties:
     TG_TOKEN = <bot token from @BotFather>
     TG_CHAT  = 7756519451
   Deploy -> New deployment -> Web app, Execute as: Me, Who has access: Anyone.
   Put the /exec URL into RELAY in js/site.js. */

function doPost(e) {
  var p = PropertiesService.getScriptProperties();
  var api = 'https://api.telegram.org/bot' + p.getProperty('TG_TOKEN') + '/';
  var chat = p.getProperty('TG_CHAT');
  var body = JSON.parse(e.postData.contents);
  var fields = body.fields || {};

  var lines = Object.keys(fields)
    .filter(function (k) { return fields[k]; })
    .map(function (k) { return k + ': ' + String(fields[k]).slice(0, 1500); });
  UrlFetchApp.fetch(api + 'sendMessage', {
    method: 'post',
    payload: { chat_id: chat, text: '🆕 New client — Lingvo site\n\n' + lines.join('\n') },
  });

  if (body.file && body.file.data) {
    var blob = Utilities.newBlob(Utilities.base64Decode(body.file.data), body.file.type || 'application/octet-stream', body.file.name || 'file');
    UrlFetchApp.fetch(api + 'sendDocument', {
      method: 'post',
      payload: { chat_id: chat, document: blob, caption: 'File from ' + (fields.Name || fields.Email || 'the site') },
    });
  }
  return ContentService.createTextOutput('ok');
}

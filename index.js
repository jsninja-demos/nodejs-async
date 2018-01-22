const fs = require('fs');
const https = require('https');
const util = require('util');

function readFilePromise(name, encode) {
  throw new Error('for test');
  return util.promisify(fs.readFile)(name, encode);
}

function writePromise(name, data, encode) {
  return util.promisify(fs.writeFile)(name, data, encode);
}

function httpsGetPromise(url) {
  return new Promise((res, rej) => {
    https.get(url, response => {
      let data = '';

      response.setEncoding('utf8');
      response.on('error', err => rej(err));
      response.on('data', d => (data += d));
      response.on('end', () => res(data));
    });
  });
}

async function start() {
  const file = await readFilePromise('./token.json', 'utf8');

  const creds = JSON.parse(file);

  setInterval(async () => {
    const response = await httpsGetPromise(
      `${creds.url}liveChatId=${creds.chatId}&key=${creds.token}`,
    );
    const { items } = JSON.parse(response);
    const history = items.map(
      i => i.snippet.textMessageDetails.messageText + '\n',
    );

    return writePromise('./chat.txt', history, 'utf8');
  }, 1000);
}
start().then(() => console.log('!!!'));

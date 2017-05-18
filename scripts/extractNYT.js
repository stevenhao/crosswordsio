const fs = require('fs');

var converter = require('../server/converter');

const nyt_cookie = process.env.NYT_COOKIE;
if (!nyt_cookie) {
  console.error('no nyt cookie detected. did you forget to source .env?');
  process.exit(0);
}

function extract(date) {
  return new Promise(function(resolve, reject) {
    date = date.toISOString().substr(0, 10);
    console.error(date);
    const path = 'downloads/' + date.substr(0, 4) + '' + date.substr(5, 2) + '' + date.substr(8, 2) + '.puz';
    console.error('ON', path);
    if (!fs.existsSync(path)) {
      console.error('SKIPPING', date);
      resolve([]);
    } else {
      console.error('CONVERTING', date);
      converter.extractClues(path, (err, res) => {
        resolve(JSON.parse(res || '[]'));
      });
    }
  });
}

function addDays(date, days) {
  let res = new Date(date);
  res.setDate(date.getDate() + days);
  return res;
}

async function go() {
  const start_date = new Date("2000-01-01");
  const end_date = new Date("2012-12-31");
  const cnts = {};
  for (var i = 0; i < 10000; i += 1) {
    const date = addDays(start_date, i);
    if (date <= end_date) {
      let clues = await extract(date);
      clues.forEach(clue => {
        if (clue.length <= 7) {
          cnts[clue] = (cnts[clue] || 0) + 1;
        }
      });
    } else break;
  }
  const allWords = Object.keys(cnts);
  console.log('nyt_words=');
  console.log(JSON.stringify(allWords));
}
go();
//download(start_date);

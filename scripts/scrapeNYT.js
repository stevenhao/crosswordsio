const request = require('request');
const fs = require('fs');
console.log('hello');

const nyt_cookie = process.env.NYT_COOKIE;
if (!nyt_cookie) {
  console.log('no nyt cookie detected. did you forget to source .env?');
  process.exit(0);
}

const j = request.jar();
const cookie = request.cookie(nyt_cookie);
j.add(cookie);
const url = 'https://www.nytimes.com';

request({url: url, jar: j}, function () {
  request('https://www.nytimes.com/crosswords/archive/').on('response', res => {
    res.pipe(fs.createWriteStream('./dl'));
  });
})

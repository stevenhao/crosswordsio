const rp = require('request-promise-native');
const moment = require('moment');
const fs = require('fs');

// XXX stop exposing steven's nyt cookie to the world
const global_nyt_cookie = process.env.NYT_COOKIE;
if (!global_nyt_cookie) {
  console.log('no global nyt cookie detected. did you forget to source .env?');
  process.exit(0);
}

function listPuzzles(nyt_cookie, date_start, date_end) {
  date_start = moment(date_start).format('YYYY-MM-DD');
  date_end = moment(date_end).format('YYYY-MM-DD');
  console.log('listPuzzles', date_start, date_end);
  const url = `https://www.nytimes.com/svc/crosswords/v3/79768691/puzzles.json?publish_type=daily&pad=true&sort_order=asc&sort_by=print_date&date_start=${date_start}&date_end=${date_end}`;
  return rp({
    url: url,
    headers: { cookie: global_nyt_cookie }
  }).then(json => {
    const body = JSON.parse(json);
    return body.results;
  });
}

function getPuzzle(nyt_cookie, date) {
  const url = `https://www.nytimes.com/svc/crosswords/v3/79768691/puzzles.json?publish_type=daily&pad=true&sort_order=asc&sort_by=print_date&date_start=${date_start}&date_end=${date_end}`;
  return rp({
    url: url,
    headers: { cookie: global_nyt_cookie }
  }).then(json => {
    const body = JSON.parse(json);
    return body.results;
  });
}


module.exports = { listPuzzles };

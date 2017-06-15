const rp = require('request-promise-native');
const fs = require('fs');
const listPuzzles = require('../server/nyt').listPuzzles;

async function go() {
  const date_start = new Date("2014-01-01");
  const date_end = new Date("2014-01-31");
  const results = await listPuzzles(date_start, date_end);
  console.log('RESULTS => ', results);
}

go();

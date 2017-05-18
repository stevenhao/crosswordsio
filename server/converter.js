var exec = require('child_process').exec;
var fs = require('fs');
var uuid = require('uuid');

let convertPuzFile = (puzPath, callerCb) => {
  exec(`python ./convert.py ${puzPath}`, (err, stdout, stderr) => {
    if (err) {
      return callerCb(err);
    }
    return callerCb(null, stdout);
  });
};

let convertPuzBuffer = (puzBuffer, callerCb) => {
  const path = `/tmp/${uuid.v4()}`;
  console.log(path);
  fs.writeFile(path, puzBuffer, (err) => {
    if (err) {
      return callerCb(err);
    } else {
      convertPuzFile(path, (err, result) => {
        if (!err) {
          fs.unlink(path);
        }
        return callerCb(err, result);
      });
    }
  });
};

let extractClues = (puzPath, callerCb) => {
  exec(`python ./extract.py ${puzPath}`, (err, stdout, stderr) => {
    if (err) {
      return callerCb(err);
    }
    return callerCb(null, stdout);
  });
} ;

module.exports = { convertPuzFile, convertPuzBuffer, extractClues };

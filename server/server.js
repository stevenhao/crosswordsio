var express = require('express');
var webpack = require('webpack');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var exec = require('child_process').exec;
var uuid = require('uuid');
var fs = require('fs');
var multer = require('multer');
var app = express();

var webpackMiddleware = require('webpack-dev-middleware');
var webpackConfigs = require('../webpack.config.js');
var compiler = webpack(webpackConfigs);

var webpackConfiguration = {
  contentBase: 'src',
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
  }
};

var currentWebpackMiddleware = webpackMiddleware(compiler, webpackConfiguration);
app.use(currentWebpackMiddleware);

const upload = multer({dest: '/tmp/uploads'});


function renderFile(res, relPath) {
  return res.sendFile(path.resolve('./client/html/' + relPath));
}

app.get('/', function (req, res) {
  renderFile(res, 'index.html');
})

app.get('/game/:id', function (req, res) {
  renderFile(res, 'index.html');
})

app.get('/admin', function (req, res) {
  renderFile(res, 'index.html');
})

app.get('/admin/upload', function (req, res) {
  renderFile(res, 'index.html');
})

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
  fs.writeFile(path, puzBuffer, (err) => {
    if (err) {
      return callerCb(err);
    }
    convertPuzFile(path, (err, result) => {
      fs.unlink(path);
      return callerCb(err, result);
    });
  });
};

app.post('/upload', upload.single('puz'), function (req, res) {
  convertPuzFile(req.file.path, (error, puzzle) => {
    fs.unlink(req.file.path);
    if (error) {
      console.log(error.message);
      res.json({error: "Could not convert file"});
    } else {
      res.json({puzzle: JSON.parse(puzzle)});
    }
    res.end();
  });
});

app.use('/assets', express.static(path.join(__dirname, '/../client/assets')));

app.use('/js', express.static(path.join(__dirname, '/../client/html/js')));

app.use('/css', express.static(path.join(__dirname, '/../client/html/css')));

app.get('/react/bundle.js', function response(req, res) {
  var filePath = path.join(__dirname, '/../client/react/bundle.js');
  console.log('Opening file: ', filePath);
  res.write(currentWebpackMiddleware.fileSystem.readFileSync(filePath));
  res.end();
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})

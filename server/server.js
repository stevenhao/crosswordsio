var express = require('express');
var webpack = require('webpack');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var favicon = require('serve-favicon');
var app = express();
var multer = require('multer');
var webpackMiddleware = require('webpack-dev-middleware');

var converter = require('./converter');
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

app.use(favicon(path.resolve('./client/favicon.ico')));

const FB_AGENT_STRINGS = ['facebot', 'facebookexternalhit'];
app.get('/', function (req, res) {
  const agent = req.headers['user-agent'];
  if (FB_AGENT_STRINGS.filter(str => agent.indexOf(str) !== -1).length > 0) {
    renderFile(res, 'fb.html');
  } else {
    renderFile(res, 'index.html');
  }
});

app.get('/puzzles', function (req, res) {
  renderFile(res, 'index.html');
});

app.get('/game/:id', function (req, res) {
  renderFile(res, 'index.html');
});

app.get('/game/solo/:id', function (req, res) {
  renderFile(res, 'index.html');
});


app.get('/puzzle/:id', function (req, res) {
  renderFile(res, 'index.html');
});

app.get('/upload', function (req, res) {
  renderFile(res, 'index.html');
});

app.get('/compose', function (req, res) {
  renderFile(res, 'index.html');
});


// Redirects
//
app.get('/admin', function (req, res) {
  res.redirect('/upload');
});

app.get('/admin/upload', function (req, res) {
  res.redirect('/upload');
});

app.post('/upload', upload.single('puz'), function (req, res) {
  converter.convertPuzFile(req.file.path, (error, puzzle) => {
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

app.use('/images', express.static(path.join(__dirname, '/../client/html/images')));


app.use('/css', express.static(path.join(__dirname, '/../client/html/css')));

app.get('/react/bundle.js', function response(req, res) {
  var filePath = path.join(__dirname, '/../client/react/bundle.js');
  console.log('Opening file: ', filePath);
  res.write(currentWebpackMiddleware.fileSystem.readFileSync(filePath));
  res.end();
});

app.listen(process.env.PORT || 4000, function () {
  console.log('Example app listening on port 4000!')
})

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackPlugins = [
  new ExtractTextPlugin('app.css')
];

process.noDeprecation = true;

module.exports = {
  entry: ['./client/react/index.js'],
  output: { path: path.resolve(__dirname, 'client/react'), filename: 'bundle.js' },
  module: {
    loaders: [
        { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file?name=public/fonts/[name].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'url?limit=8192',
          'img'
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['stage-0', 'stage-2', 'react', 'es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: webpackPlugins
};

const port = process.env.PORT || '8001';
const host = process.env.HOST || '0.0.0.0';
const express = require('express');
const app = express();
const webpack = require('webpack');

var compiler = webpack( require('./webpack.config') );
compiler.watch(200, function(err, stats) {
  if ( err ) {
    console.log('Big Time Error', err);
    process.exit();
  }

  if ( stats.hasErrors() ) {
    console.log('Compilation error', stats.toJson().errors);
    process.exit();
  }

  if ( stats.hasWarnings() ) {
    console.log('Compilation warning', stats.toJson().warnings);
  }

  console.log('Compilation complete', stats.toString({colors: true}));
})

app.use(require('./app'));
app.listen(port, host);
console.log('Server running on %s:%d...', host, port);

module.exports = app;

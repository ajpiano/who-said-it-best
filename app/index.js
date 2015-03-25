const express = require('express');
const jade = require('jade');
const _ = require('lodash');
const bodyParser = require('body-parser');
const BODY_LIMIT = '500kb';
const config = require('../config.json');
const request = require('request-promise');

var app = express();
app.use(bodyParser.json({ limit: BODY_LIMIT }));
app.use(bodyParser.urlencoded({ limit: BODY_LIMIT, extended: true }));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  res.render('index', {
    config: config
  });
});

app.get('/phrase', function(req, res){
  var words = request({
    uri: "http://api.wordnik.com:80/v4/words.json/randomWords",
    qs: {
      api_key: config.wordnik_api_key,
      minCorpusCount: 100000,
      limit: 8
    }
  });
  words.then(function(data) {
    data = JSON.parse(data);
    res.status(200).json({ words: data });
  });
});

module.exports = app;

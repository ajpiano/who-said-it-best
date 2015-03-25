const express = require('express');
const jade = require('jade');
const fs = require('fs');

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  var testimonials = fs.readFileSync(__dirname + '/data/testimonials.json');
  var subjects = fs.readFileSync(__dirname + '/data/subjects.json');

  res.render('index', {testimonials: JSON.parse(testimonials), subjects: JSON.parse(subjects)});
});

module.exports = app;

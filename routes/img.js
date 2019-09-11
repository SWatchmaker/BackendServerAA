var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.get('/:tipo/:img', (req, res) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var imgPath = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    var defaultPath = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(defaultPath);
  }
});

module.exports = app;
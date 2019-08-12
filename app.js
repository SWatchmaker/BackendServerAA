//Requires

var express = require('express');
var mongoose = require('mongoose');


//Inicializa Variables

var app = express();

//Conexión DB

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
  if (err) throw err;
  console.log("Base de Datos: \x1b[32m%s\x1b[0m", "Online!");
});

//Rutas

app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Petición realizada correctamente'
  });
});
//Escuchar peticiones

app.listen(3000, () => {
  console.log("Escuchando puerto 3000: \x1b[32m%s\x1b[0m", "Online!");
});
//Requires

var express = require('express');
var mongoose = require('mongoose');


//Inicializa Variables

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Importar Rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);


mongoose.set('useCreateIndex', true);

//Conexión DB

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', { useNewUrlParser: true }, (err, res) => {
  if (err) throw err;
  console.log("Base de Datos: \x1b[32m%s\x1b[0m", "Online!");
});

//Escuchar peticiones

app.listen(3000, () => {
  console.log("Escuchando puerto 3000: \x1b[32m%s\x1b[0m", "Online!");
});
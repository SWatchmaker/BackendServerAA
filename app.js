//Requires

var express = require('express');
var mongoose = require('mongoose');

//Inicializa Variables

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Importar Rutas

var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busqRoutes = require('./routes/buscar');
var uploadRoute = require('./routes/upload');
var imgRoute = require('./routes/img');

app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/buscar', busqRoutes);
app.use('/upload', uploadRoute);
app.use('/img', imgRoute);
app.use('/', appRoutes);

mongoose.set('useCreateIndex', true);

//Conexión DB

mongoose.connection.openUri(
  'mongodb://localhost:27017/HospitalDB', { useNewUrlParser: true },
  (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'Online!');
  }
);

//Escuchar peticiones

app.listen(3000, () => {
  console.log('Escuchando puerto 3000: \x1b[32m%s\x1b[0m', 'Online!');
});
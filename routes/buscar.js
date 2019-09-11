var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//BÚSQUEDA GENERAL

app.get('/todos/:busqueda', (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');
  console.log('this');

  Promise.all([
    buscarHospitales(regex),
    buscarMedicos(regex),
    buscarUsuarios(regex)
  ]).then(resultados => {
    res.status(200).json({
      ok: true,
      hospitales: resultados[0],
      medicos: resultados[1],
      usuarios: resultados[2]
    });
  });
});

//BÚSQUEDA POR COLECCIÓN

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
  var tabla = req.params.tabla;
  var regex = new RegExp(req.params.busqueda, 'i');
  var coleccion;

  switch (tabla) {
    case 'medicos':
      coleccion = buscarMedicos(regex);
      break;
    case 'hospitales':
      coleccion = buscarHospitales(regex);
      break;
    case 'usuarios':
      coleccion = buscarUsuarios(regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'La colección indicada no existe.'
      });
  }
  coleccion.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex }, (err, hospitales) => {
      if (err) {
        reject('Error al cargar hospitales', err);
      } else {
        resolve(hospitales);
      }
    });
  });
}

function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex }, (err, medicos) => {
      if (err) {
        reject('Error al cargar médicos', err);
      } else {
        resolve(medicos);
      }
    });
  });
}

function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email')
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usuarios.', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
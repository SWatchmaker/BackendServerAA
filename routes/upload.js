var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.use(fileupload());

app.put('/:tipo/:id', (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

  if (tiposValidos.indexOf(tipo) === -1) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección no válida.',
      errors: {
        message: 'Los tipos válidas son ' + tiposValidos.join(', ') + '.'
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No seleccionó nada.',
      errors: { message: 'Debe seleccionar una imagen' }
    });
  }

  //OBTIENE NOMBRE DE ARCHIVO

  var archivo = req.files.imagen;
  var archivoSplit = archivo.name.split('.');
  var extension = archivoSplit[archivoSplit.length - 1];

  //VALIDA EXTENSIÓN

  var validExts = ['png', 'jpg', 'gif', 'jpeg'];

  if (validExts.indexOf(extension) === -1) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extensión no válida.',
      errors: {
        message: 'Las extensiones válidas son ' + validExts.join(', ') + '.'
      }
    });
  }

  // GENERA NOMBRE RANDOM

  var nombreFile = `${id}_${new Date().getMilliseconds()}.${extension}`;
  var path = `./uploads/${tipo}/${nombreFile}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al guardar archivo.',
        errors: err
      });
    } else {
      subirPorTipo(tipo, id, nombreFile, res);
    }
  });
});

function subirPorTipo(tipo, id, nombreFile, res) {
  if (tipo === 'usuarios') {
    Usuario.findById(id, 'nombre email img', (err, usuario) => {
      var oldPath = `./uploads/usuarios/${usuario.img}`;

      if (!usuario) {
        res.status(400).json({
          ok: false,
          mensaje: 'Usuario no existe.',
          errors: { message: 'Usuario no existe.' }
        });
      }

      //ELIMINA IMAGEN ANTERIOR SI EXISTE
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (error) {
          console.log(err);
        }
      }
      usuario.img = nombreFile;
      usuario.save((err, usuarioAct) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar usuario.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            mensaje: 'Imagen de usuario actualizada.',
            usuario: usuarioAct
          });
        }
      });
    });
  } else if (tipo === 'medicos') {
    Medico.findById(id, (err, medico) => {
      var oldPath = `./uploads/medicos/${medico.img}`;

      if (!medico) {
        res.status(400).json({
          ok: false,
          mensaje: 'Médico no existe.',
          errors: { message: 'Médico no existe.' }
        });
      }

      //ELIMINA IMAGEN ANTERIOR SI EXISTE
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (error) {
          console.log(err);
        }
      }
      medico.img = nombreFile;
      medico.save((err, medicoAct) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar médico.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            mensaje: 'Imagen de médico actualizada.',
            medico: medicoAct
          });
        }
      });
    });
  } else if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      var oldPath = `./uploads/hospitales/${hospital.img}`;

      if (!hospital) {
        res.status(400).json({
          ok: false,
          mensaje: 'Hospital no existe.',
          errors: { message: 'Hospital no existe.' }
        });
      }

      //ELIMINA IMAGEN ANTERIOR SI EXISTE
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (error) {
          console.log(err);
        }
      }
      hospital.img = nombreFile;
      hospital.save((err, hospitalAct) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar hospital.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            mensaje: 'Imagen de hospital actualizada.',
            hospital: hospitalAct
          });
        }
      });
    });
  }
}

module.exports = app;
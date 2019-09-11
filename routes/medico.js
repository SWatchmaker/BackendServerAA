var express = require('express');
var app = express();
var Medico = require('../models/medico');
var mdAuth = require('../middlewares/autenticacion');

//OBTIENE TODOS LOS MÉDICOS

app.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({}, 'nombre img')
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital', 'nombre')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la DB.',
          errors: err
        });
      } else {
        Medico.count({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            medicos,
            conteo
          });
        });
      }
    });
});

//CREA UN NUEVO HOSPITAL

app.post('/', mdAuth.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    hospital: body.hospital,
    usuario: req.usuario._id
  });

  medico.save((err, savedMed) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear médico.',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        medico: savedMed
      });
    }
  });
});

//ACTUALIZAR MÉDICO

app.put('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, 'nombre hospital usuario', (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar médico.',
        errors: err
      });
    } else if (!medico) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El médico no existe.',
        errors: err
      });
    } else {
      medico.nombre = body.nombre ? body.nombre : medico.nombre;
      medico.hospital = body.hospital ? body.hospital : medico.hospital;
      medico.usuario = req.usuario._id ? req.usuario._id : medico.usuario;

      medico.save((err, savedMed) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar médico.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            medico: savedMed
          });
        }
      });
    }
  });
});

// ELIMINAR USUARIO

app.delete('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, deletedMed) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar médico.',
        errors: err
      });
    } else if (!deletedMed) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El médico no existe.',
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        medico: deletedMed
      });
    }
  });
});

module.exports = app;
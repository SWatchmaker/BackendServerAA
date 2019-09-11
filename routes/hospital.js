var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var mdAuth = require('../middlewares/autenticacion');

//OBTIENE TODOS LOS HOSPITALES

app.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({}, 'nombre usuario')
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la DB.',
          errors: err
        });
      } else {
        Hospital.count({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            hospitales,
            conteo
          });
        });
      }
    });
});

//CREA UN NUEVO HOSPITAL

app.post('/', mdAuth.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, savedHosp) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital.',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        hospital: savedHosp
      });
    }
  });
});

//ACTUALIZAR HOSPITAL

app.put('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, 'nombre usuario', (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital.',
        errors: err
      });
    } else if (!hospital) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El hospital no existe.',
        errors: err
      });
    } else {
      hospital.nombre = body.nombre ? body.nombre : hospital.nombre;
      hospital.usuario = req.usuario._id;

      hospital.save((err, savedHosp) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar hospital.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            hospital: savedHosp
          });
        }
      });
    }
  });
});

// ELIMINAR USUARIO

app.delete('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, deletedHosp) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar hospital.',
        errors: err
      });
    } else if (!deletedHosp) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El hospital no existe.',
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        hospital: deletedHosp
      });
    }
  });
});

module.exports = app;
var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario');
var mdAuth = require('../middlewares/autenticacion');

//OBTIENE TODOS LOS USUARIOS

app.get('/', (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error en la DB.',
          errors: err
        });
      } else {
        Usuario.count({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            usuarios,
            conteo
          });
        });
      }
    });
});

//ACTUALIZAR USUARIO

app.put('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, 'nombre email img role', (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario.',
        errors: err
      });
    } else if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El usuario no existe.',
        errors: err
      });
    } else {
      usuario.nombre = body.nombre ? body.nombre : usuario.nombre;
      usuario.email = body.email ? body.email : usuario.email;
      usuario.role = body.role ? body.role : usuario.role;

      usuario.save((err, savedUser) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario.',
            errors: err
          });
        } else {
          res.status(200).json({
            ok: true,
            usuario: savedUser
          });
        }
      });
    }
  });
});

//CREA UN NUEVO USUARIO

app.post('/', mdAuth.verificaToken, (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: body.password ? bcrypt.hashSync(body.password, 10) : null,
    img: body.img,
    role: body.role
  });

  usuario.save((err, savedUser) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario.',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        usuario: savedUser
      });
    }
  });
});

// ELIMINAR USUARIO

app.delete('/:id', mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, deletedUser) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar usuario.',
        errors: err
      });
    } else if (!deletedUser) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El usuario no existe.',
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        usuario: deletedUser
      });
    }
  });
});

module.exports = app;
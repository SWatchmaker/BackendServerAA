var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();
var Usuario = require('../models/usuario');

//AUTENTICACIÓN DESDE GOOGLE SIGN IN

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post('/google', async(req, res) => {
  var token = req.body.token;
  var googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token no válido.'
    });
  });

  Usuario.findOne({ email: googleUser.email },
    'nombre email img role',
    (err, usuario) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err
        });
      } else if (!usuario) {
        //SI EL USUARIO NO ESTÁ REGISTRADO LE CREA REGISTRO CON SU CUENTA DE GOOGLE
        var newUsuario = new Usuario();
        newUsuario.nombre = googleUser.nombre;
        newUsuario.email = googleUser.email;
        newUsuario.img = googleUser.img;
        newUsuario.google = true;
        newUsuario.password = ':)';

        newUsuario.save((err, savedUser) => {
          res.status(200).json({
            ok: true,
            usuarios: savedUser,
            token,
            message: 'Login correcto!'
          });
        });
      } else if (!usuarios.google) {
        //SI EL USUARIO YA ESTÁ REGISTRADO DEBE INICIAR SESIÓN CON SUS CREDENCIALES Y LIGAR SU CUENTA DE GOOGLE DESDE SU PERFIL
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe usar autenticación normal.'
        });
      } else {
        var token = jwt.sign({ usuario }, SEED, {
          expiresIn: 14400
        }); //4 horas

        res.status(200).json({
          ok: true,
          usuarios: usuario,
          token,
          message: 'Login correcto!'
        });
      }
    }
  );
});

//LOGIN NORMAL

app.post('/', (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email },
    'nombre email img role password',
    (err, logedUser) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err
        });
      } else if (!logedUser) {
        res.status(404).json({
          ok: false,
          mensaje: 'Credenciales incorrectas (email)',
          errors: err
        });
      } else if (bcrypt.compareSync(body.password, logedUser.password)) {
        var token = jwt.sign({ usuario: logedUser }, SEED, {
          expiresIn: 14400
        }); //4 horas

        logedUser.password = '-';

        res.status(200).json({
          ok: true,
          usuarios: logedUser,
          token,
          message: 'Login correcto!'
        });
      } else {
        res.status(404).json({
          ok: false,
          mensaje: 'Credenciales incorrectas (password)',
          errors: err
        });
      }
    }
  );
});

module.exports = app;
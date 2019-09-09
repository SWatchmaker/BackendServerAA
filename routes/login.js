var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/usuario");

app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email },
    "nombre email img role password",
    (err, logedUser) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar usuario",
          errors: err
        });
      } else if (!logedUser) {
        res.status(404).json({
          ok: false,
          mensaje: "Credenciales incorrectas (email)",
          errors: err
        });
      } else if (bcrypt.compareSync(body.password, logedUser.password)) {
        var token = jwt.sign({ usuario: logedUser }, SEED, {
          expiresIn: 14400
        }); //4 horas

        logedUser.password = "-";

        res.status(200).json({
          ok: true,
          usuarios: logedUser,
          token,
          message: "Login correcto!"
        });
      } else {
        res.status(404).json({
          ok: false,
          mensaje: "Credenciales incorrectas (password)",
          errors: err
        });
      }
    }
  );
});

module.exports = app;
var SEED = require("../config/config").SEED;
var jwt = require("jsonwebtoken");

//VERIFICA TOKEN
exports.verificaToken = function(req, res, next) {
  var token = req.query.token;
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      res.status(401).json({
        ok: false,
        mensaje: "Token inválido",
        errors: err
      });
    } else {
      req.usuario = decoded.usuario;
      next();
      // res.status(200).json({
      //   ok: true,
      //   decoded
      // });
    }
  });
};
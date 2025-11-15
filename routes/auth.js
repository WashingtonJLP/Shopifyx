const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// LOGIN (token 15 min)

router.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  const usuario = await Usuario.findOne({ nome });
  if (!usuario)
    return res.status(404).json({ erro: "Usuário não encontrado" });

  if (usuario.senha !== senha)
    return res.status(401).json({ erro: "Senha incorreta" });

  // TOKEN EXPIRA 
  const token = jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.json({ token });
});

// VALIDAR TOKEN 

router.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) 
    return res.status(401).json({ erro: "Token não enviado" });

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ ok: true });

  } catch (err) {
    return res.status(401).json({ erro: "Token expirado" });
  }
});

module.exports = router;

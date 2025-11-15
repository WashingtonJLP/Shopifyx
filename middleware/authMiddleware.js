const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ erro: "Token não enviado." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();

  } catch (err) {
    return res.status(401).json({ erro: "Sessão expirada. Faça login novamente." });
  }
};

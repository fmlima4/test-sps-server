const jwt = require('jsonwebtoken');
const database = require('../database/db');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não fornecido',
      message: 'É necessário fornecer um token de autenticação'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({
      error: 'Formato do token inválido',
      message: 'O token deve seguir o formato: Bearer <token>'
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      error: 'Formato do token inválido',
      message: 'O token deve começar com "Bearer"'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = database.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não encontrado'
      });
    }

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.type;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'O token de autenticação expirou'
      });
    }

    return res.status(401).json({
      error: 'Token inválido',
      message: 'Falha na verificação do token'
    });
  }
};

module.exports = authMiddleware;

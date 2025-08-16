const { Router } = require('express');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/auth');
const { 
  validateLogin, 
  validateCreateUser, 
  validateUpdateUser 
} = require('./utils/validations/userValidations');

const routes = Router();

routes.get('/', (req, res) => {
  res.status(200).json({
    message: 'API SPS Test - Sistema de Gerenciamento de Usuários',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/login': 'Realizar login'
      },
      users: {
        'GET /users': 'Listar usuários (requer autenticação)',
        'POST /users': 'Criar usuário (requer autenticação)',
        'PUT /users/:id': 'Atualizar usuário (requer autenticação)',
        'DELETE /users/:id': 'Deletar usuário (requer autenticação)'
      }
    }
  });
});

// Rotas de autenticação
routes.post('/auth/login', validateLogin, authController.login);

// Rotas de usuários (todas protegidas)
routes.use('/users', authMiddleware);
routes.get('/users', userController.list);
routes.post('/users', validateCreateUser, userController.create);
routes.put('/users/:id', validateUpdateUser, userController.update);
routes.delete('/users/:id', userController.delete);

// Middleware para rotas não encontradas
routes.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: [
      'POST /auth/login',
      'GET /users',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id'
    ]
  });
});

module.exports = routes;
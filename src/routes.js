const { Router } = require('express');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const healthController = require('./controllers/healthController');
const authMiddleware = require('./middlewares/auth');
const {
  validateLogin,
  validateCreateUser,
  validateUpdateUser
} = require('./utils/validations/userValidations');
const { swaggerUi, specs } = require('./docs/swagger');

const routes = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações da API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Informações básicas da API
 */
routes.get('/', (req, res) => {
  res.status(200).json({
    message: 'API SPS Test - Sistema de Gerenciamento de Usuários',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    health: '/health',
    metrics: '/metrics',
    endpoints: {
      auth: {
        'POST /auth/login': 'Realizar login'
      },
      users: {
        'GET /users': 'Listar usuários (requer autenticação)',
        'POST /users': 'Criar usuário (requer autenticação)',
        'PUT /users/:id': 'Atualizar usuário (requer autenticação)',
        'DELETE /users/:id': 'Deletar usuário (requer autenticação)'
      },
      monitoring: {
        'GET /health': 'Health check da aplicação',
        'GET /health/readiness': 'Readiness probe',
        'GET /health/liveness': 'Liveness probe',
        'GET /metrics': 'Métricas da aplicação'
      }
    }
  });
});

// Documentação da API
routes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'SPS Test API',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// Health checks e métricas
routes.get('/health', healthController.health);
routes.get('/health/readiness', healthController.readiness);
routes.get('/health/liveness', healthController.liveness);
routes.get('/metrics', healthController.metrics);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realizar login
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas tentativas de login
 */
routes.post('/auth/login', validateLogin, authController.login);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Token de autenticação inválido
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       409:
 *         description: Email já cadastrado
 *       429:
 *         description: Limite de criação excedido
 */
// Rotas de usuários (todas protegidas)
routes.use('/users', authMiddleware);
routes.get('/users', userController.list);
routes.post('/users', validateCreateUser, userController.create);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email já cadastrado
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Não é possível deletar própria conta
 *       404:
 *         description: Usuário não encontrado
 */
routes.put('/users/:id', validateUpdateUser, userController.update);
routes.delete('/users/:id', userController.delete);

// Middleware para rotas não encontradas
routes.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /api-docs',
      'GET /health',
      'GET /metrics',
      'POST /auth/login',
      'GET /users',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id'
    ]
  });
});

module.exports = routes;

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const routes = require('./routes');
const { logger } = require('./utils/logger');

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP temporariamente
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compression
app.use(compression());

app.use((req, res, next) => {
  // Permitir todas as origens temporariamente
  res.header('Access-Control-Allow-Origin', '*');
  // Métodos permitidos
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Headers permitidos
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsing middlewares
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        error: 'JSON inválido',
        message: 'O corpo da requisição contém um JSON mal formado'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Trust proxy (para rate limiting e logs corretos)
app.set('trust proxy', 1);

// Rotas
app.use(routes);

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  // Log do erro
  logger.error('Erro não tratado:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erro de JSON mal formado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'O corpo da requisição contém um JSON mal formado'
    });
  }

  // Erro de CORS
  if (error.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      error: 'CORS não permitido',
      message: 'Origem não autorizada para acessar este recurso'
    });
  }

  // Erro de payload muito grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Payload muito grande',
      message: 'O tamanho da requisição excede o limite permitido'
    });
  }

  // Outros erros
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Ocorreu um erro inesperado',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Recebido sinal ${signal}. Iniciando graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error('Erro durante o graceful shutdown:', err);
      process.exit(1);
    }

    logger.info('Servidor fechado com sucesso');
    process.exit(0);
  });

  // Forçar shutdown após 30 segundos
  setTimeout(() => {
    logger.error('Forçando shutdown após timeout');
    process.exit(1);
  }, 30000);
};

const PORT = process.env.PORT || 3000;

// Só iniciar o servidor se não estivermos em ambiente de teste
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📋 Documentação disponível em http://localhost:${PORT}/api-docs`);
    logger.info(`💚 Health check disponível em http://localhost:${PORT}/health`);
    logger.info(`📊 Métricas disponíveis em http://localhost:${PORT}/metrics`);

    if (process.env.NODE_ENV !== 'production') {
      logger.info('🔧 Modo de desenvolvimento ativo');
      logger.info('👤 Usuário admin: admin@spsgroup.com.br / 1234');
    }
  });

  // Configurar graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Tratar erros não capturados
  process.on('uncaughtException', (err) => {
    logger.error('Exceção não capturada:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejection não tratada:', { reason, promise });
    process.exit(1);
  });
}

module.exports = app;

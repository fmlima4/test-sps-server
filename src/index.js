require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging das requisições (ambiente de desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Rotas
app.use(routes);

app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  // Erro de JSON mal formado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'O corpo da requisição contém um JSON mal formado'
    });
  }
  
  // Outros erros
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Ocorreu um erro inesperado'
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📋 Documentação disponível em http://localhost:${PORT}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔧 Modo de desenvolvimento ativo`);
      console.log(`👤 Usuário admin: admin@spsgroup.com.br / 1234`);
    }
  });
}

module.exports = app;
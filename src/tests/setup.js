// Setup para os testes
require('dotenv').config({ path: '.env.test' });

// Configurar variáveis de ambiente para teste
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';

// Limpar console.log durante os testes
console.log = jest.fn();
console.error = jest.fn();

// Configuração global do Jest para evitar problemas de timeout
jest.setTimeout(10000);
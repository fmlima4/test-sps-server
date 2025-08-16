🚀 Tecnologias Utilizadas

Node.js - Runtime JavaScript
Express.js - Framework web
JWT (jsonwebtoken) - Autenticação
bcryptjs - Hash de senhas
Joi - Validação de dados
Jest & Supertest - Testes automatizados
CORS - Controle de acesso
dotenv - Gerenciamento de variáveis de ambiente

🔧 Instalação e Configuração
Pré-requisitos

Node.js (v14 ou superior)
npm ou yarn

Instalação
# Clone o repositório
git clone <url-do-repositorio>
cd test-sps-server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

Configuração do .env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

🏃‍♂️ Execução
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start

🧪 Testes
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm test -- --coverage

📡 Endpoints da API
Exemplos de requisi;'ao disponiveis no arquivo REQUESTS EXAMPLES.yaml'

📝 Observações Técnicas
Banco em memória: Os dados são perdidos quando o servidor é reiniciado
JWT: Tokens têm validade configurável (padrão: 24h)
Senhas: Nunca retornadas nas respostas da API
Auto-exclusão: Usuários não podem deletar suas próprias contas
Unicidade de email: Validação tanto na criação quanto na atualização
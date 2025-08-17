const request = require('supertest');
const app = require('../index');

describe('API SPS Test', () => {
  let authToken;
  let testUserId;

  // Configurar token de autenticação antes dos testes
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@spsgroup.com.br',
        password: '1234'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /', () => {
    it('deve retornar informações da API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('API SPS Test - Sistema de Gerenciamento de Usuários');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: '1234'
        })
        .expect(200);

      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('deve retornar erro com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: 'senhaerrada'
        })
        .expect(401);

      expect(response.body.error).toBe('Credenciais inválidas');
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'email-invalido'
        })
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
      expect(response.body.messages).toContain('Email deve ter um formato válido');
      expect(response.body.messages).toContain('Senha é obrigatória');
    });
  });

  describe('POST /users', () => {
    it('deve criar um novo usuário com dados válidos', async () => {
      const userData = {
        name: 'Teste User',
        email: 'teste@example.com',
        type: 'user',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Usuário criado com sucesso');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();

      testUserId = response.body.user.id;
    });

    it('deve retornar erro ao tentar criar usuário com email duplicado', async () => {
      const userData = {
        name: 'Outro User',
        email: 'admin@spsgroup.com.br', // Email já existente
        password: 'senha123'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve retornar erro sem token de autenticação', async () => {
      const userData = {
        name: 'Teste User',
        email: 'novo@example.com',
        password: 'senha123'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A', // Nome muito curto
          email: 'email-invalido'
        })
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
      expect(response.body.messages).toContain('Nome deve ter pelo menos 3 caracteres');
      expect(response.body.messages).toContain('Email deve ter um formato válido');
      expect(response.body.messages).toContain('Senha é obrigatória');
    });
  });

  describe('GET /users', () => {
    it('deve listar todos os usuários', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Usuários listados com sucesso');
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);

      // Verificar se senhas não são retornadas
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    it('deve retornar erro sem token de autenticação', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });
  });

  describe('GET /users/:id', () => {
    let existingUserId;

    beforeAll(async () => {
    // Criar um usuário para teste
      const createResponse = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Usuário Teste Get',
          email: 'teste-get@example.com',
          password: 'senha123'
        });

      existingUserId = createResponse.body.user.id;
    });

    it('deve retornar um usuário específico por ID', async () => {
      const response = await request(app)
        .get(`/users/${existingUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Usuário encontrado com sucesso');
      expect(response.body.user.id).toBe(existingUserId);
      expect(response.body.user.name).toBe('Usuário Teste Get');
      expect(response.body.user.email).toBe('teste-get@example.com');
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.type).toBeUndefined();
    });

    it('deve retornar erro 404 para usuário inexistente', async () => {
      const response = await request(app)
        .get('/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });

    it('deve retornar erro sem token de autenticação', async () => {
      const response = await request(app)
        .get(`/users/${existingUserId}`)
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });
  });

  describe('PUT /users/:id', () => {
    it('deve atualizar um usuário existente', async () => {
      const updateData = {
        name: 'Nome Atualizado',
        email: 'emailatualizado@example.com'
      };

      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Usuário atualizado com sucesso');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.email).toBe(updateData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('deve retornar erro ao tentar atualizar usuário inexistente', async () => {
      const response = await request(app)
        .put('/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Nome Teste' })
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });

    it('deve retornar erro ao tentar atualizar com email duplicado', async () => {
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'admin@spsgroup.com.br' })
        .expect(409);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve validar dados de atualização', async () => {
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'email-invalido' })
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
      expect(response.body.messages).toContain('Email deve ter um formato válido');
    });

    it('deve retornar erro sem dados para atualização', async () => {
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
      expect(response.body.messages).toContain('Pelo menos um campo deve ser fornecido para atualização');
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve retornar erro ao tentar deletar usuário inexistente', async () => {
      const response = await request(app)
        .delete('/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });

    it('deve deletar um usuário existente', async () => {
      const response = await request(app)
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Usuário deletado com sucesso');

      // Verificar se o usuário foi realmente deletado
      const getResponse = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      const deletedUser = getResponse.body.users.find(user => user.id === testUserId);
      expect(deletedUser).toBeUndefined();
    });

    it('deve retornar erro ao tentar deletar própria conta', async () => {
      // Primeiro, pegar o ID do usuário admin logado
      const usersResponse = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      const adminUser = usersResponse.body.users.find(user => user.email === 'admin@spsgroup.com.br');

      const response = await request(app)
        .delete(`/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Operação não permitida');
      expect(response.body.message).toBe('Você não pode deletar sua própria conta');
    });
  });

  describe('Rotas não encontradas', () => {
    it('deve retornar erro 404 para rota inexistente', async () => {
      const response = await request(app)
        .get('/rota-inexistente')
        .expect(404);

      expect(response.body.error).toBe('Rota não encontrada');
      expect(response.body.availableRoutes).toBeDefined();
    });
  });

  describe('Middleware de autenticação', () => {
    it('deve retornar erro com token inválido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body.error).toBe('Token inválido');
    });

    it('deve retornar erro com formato de token inválido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.error).toBe('Formato do token inválido');
    });

    it('deve retornar erro sem Bearer no token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'token-sem-bearer')
        .expect(401);

      expect(response.body.error).toBe('Formato do token inválido');
    });
  });

  describe('Validação de dados', () => {
    it('deve retornar erro com JSON mal formado', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@test.com", "password":}')
        .expect(400);

      expect(response.body.error).toBe('JSON inválido');
    });
  });
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPS Test API',
      version: '1.0.0',
      description: 'Sistema de Gerenciamento de Usuários - API RESTful',
      contact: {
        name: 'Desenvolvedor',
        email: 'dev@spsgroup.com.br'
      }
    },
    servers: [
      {
        url: '/',
        description: 'Mesma origem da API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              minLength: 2,
              maxLength: 100
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário'
            },
            type: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'Tipo de usuário'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@spsgroup.com.br'
            },
            password: {
              type: 'string',
              example: '1234'
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@example.com'
            },
            type: {
              type: 'string',
              enum: ['admin', 'user'],
              default: 'user',
              example: 'user'
            },
            password: {
              type: 'string',
              minLength: 4,
              maxLength: 50,
              example: 'senha123'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100
            },
            email: {
              type: 'string',
              format: 'email'
            },
            type: {
              type: 'string',
              enum: ['admin', 'user']
            },
            password: {
              type: 'string',
              minLength: 4,
              maxLength: 50
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo do erro'
            },
            message: {
              type: 'string',
              description: 'Descrição do erro'
            },
            messages: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de erros de validação'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};

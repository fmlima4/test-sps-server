const Joi = require('joi');

const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha é obrigatória'
    })
});

const createUserValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  type: Joi.string()
    .valid('admin', 'user')
    .default('user')
    .messages({
      'any.only': 'Tipo deve ser "admin" ou "user"'
    }),
  password: Joi.string()
    .min(4)
    .max(50)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 4 caracteres',
      'string.max': 'Senha deve ter no máximo 50 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

const updateUserValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Email deve ter um formato válido'
    }),
  type: Joi.string()
    .valid('admin', 'user')
    .messages({
      'any.only': 'Tipo deve ser "admin" ou "user"'
    }),
  password: Joi.string()
    .min(4)
    .max(50)
    .messages({
      'string.min': 'Senha deve ter pelo menos 4 caracteres',
      'string.max': 'Senha deve ter no máximo 50 caracteres'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Dados inválidos',
        messages: errorMessages
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateLogin: validateRequest(loginValidation),
  validateCreateUser: validateRequest(createUserValidation),
  validateUpdateUser: validateRequest(updateUserValidation)
};
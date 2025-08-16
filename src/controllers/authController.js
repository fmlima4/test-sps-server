const jwt = require('jsonwebtoken');
const database = require('../database/db');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = database.findUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Ususario nao encontrado'
        });
      }

      const isValidPassword = await database.validatePassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: user.type
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN
        }
      );

      const userWithoutPassword = database.getUserWithoutPassword(user);

      res.status(200).json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante o processo de autenticação'
      });
    }
  }
}

module.exports = new AuthController();
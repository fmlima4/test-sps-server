const database = require('../database/db');

class UserController {
  async create(req, res) {
    try {
      const { name, email, type, password } = req.body;

      // Verificar se email já existe
      const existingUser = database.findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado por outro usuário'
        });
      }

      const newUser = await database.createUser({
        name,
        email,
        type: type || 'user', // se nao informar crio como usuario normal
        password
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: newUser
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante a criação do usuário'
      });
    }
  }

  async list(req, res) {
    try {
      const users = database.getAllUsers();

      res.status(200).json({
        message: 'Usuários listados com sucesso',
        users,
        total: users.length
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante a listagem dos usuários'
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se usuário existe
      const existingUser = database.findUserById(id);

      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'Usuário com o ID especificado não existe'
        });
      }

      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = database.findUserByEmail(updateData.email);

        if (emailExists) {
          return res.status(409).json({
            error: 'Email já cadastrado',
            message: 'Este email já está sendo usado por outro usuário'
          });
        }
      }

      const updatedUser = database.updateUser(id, updateData);

      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        user: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante a atualização do usuário'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const existingUser = database.findUserById(id);

      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'Usuário com o ID especificado não existe'
        });
      }

      if (parseInt(id) === req.userId) {
        return res.status(403).json({
          error: 'Operação não permitida',
          message: 'Você não pode deletar sua própria conta'
        });
      }

      const deleted = database.deleteUser(id);

      if (!deleted) {
        return res.status(500).json({
          error: 'Erro interno',
          message: 'Não foi possível deletar o usuário'
        });
      }

      res.status(200).json({
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante a exclusão do usuário'
      });
    }
  }
}

module.exports = new UserController();

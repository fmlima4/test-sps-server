const bcrypt = require('bcryptjs');

class InMemoryDatabase {
  constructor() {
    this.users = [];
    this.nextId = 1;
    this.initializeAdminUser();
  }

  async initializeAdminUser() {
    const hashedPassword = await bcrypt.hash('1234', 10);

    this.users.push({
      id: this.nextId++,
      name: 'admin',
      email: 'admin@spsgroup.com.br',
      type: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      id: this.nextId++,
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    return this.getUserWithoutPassword(newUser);
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findUserById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  getAllUsers() {
    return this.users.map(user => this.getUserWithoutPassword(user));
  }

  updateUser(id, userData) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      return null;
    }

    if (userData.password) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    return this.getUserWithoutPassword(this.users[userIndex]);
  }

  deleteUser(id) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }

  getUserWithoutPassword(user) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new InMemoryDatabase();

const os = require('os');
const process = require('process');
const database = require('../database/db');

class HealthController {
  async health(req, res) {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: this.checkDatabase(),
        memory: this.checkMemory(),
        disk: this.checkDisk()
      }
    };

    // Verificar se todos os serviços estão OK
    const servicesStatus = Object.values(healthCheck.services);
    const isHealthy = servicesStatus.every(service => service.status === 'OK');

    if (!isHealthy) {
      healthCheck.status = 'DEGRADED';
    }

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  }

  async metrics(req, res) {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        architecture: os.arch(),
        nodeVersion: process.version,
        uptime: {
          process: Math.floor(process.uptime()),
          system: Math.floor(os.uptime())
        },
        memory: {
          used: process.memoryUsage(),
          free: os.freemem(),
          total: os.totalmem(),
          usage: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
          }
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model,
          loadAverage: os.loadavg()
        }
      },
      application: {
        totalUsers: database.getAllUsers().length,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
      }
    };

    res.status(200).json(metrics);
  }

  async readiness(req, res) {
    // Verificações mais rigorosas para readiness
    const checks = {
      database: this.checkDatabase(),
      memory: this.checkMemory(),
      diskSpace: this.checkDisk()
    };

    const isReady = Object.values(checks).every(check => check.status === 'OK');
    const status = isReady ? 'READY' : 'NOT_READY';

    res.status(isReady ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      checks
    });
  }

  async liveness(req, res) {
    // Verificação básica se a aplicação está viva
    res.status(200).json({
      status: 'ALIVE',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }

  checkDatabase() {
    try {
      // Tentar uma operação simples no banco
      const users = database.getAllUsers();
      return {
        status: 'OK',
        message: 'Database accessible',
        totalUsers: users.length
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  checkMemory() {
    const memUsage = process.memoryUsage();
    const memUsedMB = memUsage.heapUsed / 1024 / 1024;
    const memThreshold = 500; // 500MB threshold

    if (memUsedMB > memThreshold) {
      return {
        status: 'WARNING',
        message: `High memory usage: ${Math.round(memUsedMB)}MB`,
        usage: `${Math.round(memUsedMB)}MB`
      };
    }

    return {
      status: 'OK',
      message: 'Memory usage normal',
      usage: `${Math.round(memUsedMB)}MB`
    };
  }

  checkDisk() {
    // Simulação de verificação de disco
    // Em uma aplicação real, você usaria uma biblioteca como 'node-df'
    return {
      status: 'OK',
      message: 'Disk space sufficient',
      note: 'Using in-memory database'
    };
  }
}

module.exports = new HealthController();

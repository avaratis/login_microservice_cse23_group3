const path = require('path');
const grpc = require('@grpc/grpc-js');
const pino = require('pino');
const protoLoader = require('@grpc/proto-loader');

const charge = require('./charge');

const logger = pino({
  name: 'loginservice-server',
  messageKey: 'message',
  formatters: {
    level (logLevelString, logLevelNum) {
      return { severity: logLevelString }
    }
  }
});

class LoginServiceServer {
  constructor(protoRoot, port = LoginServiceServer.PORT) {
    this.port = port;
    this.protoRoot = protoRoot;

    this.packages = {
      login: this.loadProto(path.join(protoRoot, 'login.proto')),
      health: this.loadProto(path.join(protoRoot, 'grpc/health/v1/health.proto'))
    };

    this.server = new grpc.Server();
    this.loadAllProtos(protoRoot);
  }

  static LoginServiceHandler(call, callback) {
    try {
      logger.info(`LoginService#Login invoked with request ${JSON.stringify(call.request)}`);
      // Process the login request here
      const response = { success: true };
      callback(null, response);
    } catch (err) {
      console.warn(err);
      callback(err);
    }
  }

  static CheckHandler(call, callback) {
    callback(null, { status: 'SERVING' });
  }

  listen() {
    const server = this.server;
    const port = this.port;
    server.bindAsync(
      `[::]:${port}`,
      grpc.ServerCredentials.createInsecure(),
      function () {
        logger.info(`LoginService gRPC server started on port ${port}`);
        server.start();
      }
    );
  }

  loadProto(path) {
    const packageDefinition = protoLoader.loadSync(
      path,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );
    return grpc.loadPackageDefinition(packageDefinition);
  }

  loadAllProtos(protoRoot) {
    const loginPackage = this.packages.login.login;
    const healthPackage = this.packages.health.grpc.health.v1;

    this.server.addService(
      loginPackage.LoginService.service,
      {
        login: LoginServiceServer.LoginServiceHandler.bind(this)
      }
    );

    this.server.addService(
      healthPackage.Health.service,
      {
        check: LoginServiceServer.CheckHandler.bind(this)
      }
    );
  }
}

LoginServiceServer.PORT = process.env.PORT;

module.exports = LoginServiceServer;

import http from 'node:http';
import https from 'node:https';
import Koa from 'koa';
import connectMongo from './connectMongo.mjs';

export default async ({
  port,
  middlewares = [],
  cert,
  mongo: mongoConfig,
  onError,
  ...other
}) => {
  if (mongoConfig) {
    await connectMongo(mongoConfig);
  }
  const app = new Koa();

  middlewares.forEach((fn) => {
    app.use(fn);
  });

  const schema = cert ? https : http;

  const options = {
    ...other,
  };

  if (cert) {
    options.key = cert.key;
    options.cert = cert.cert;
  }

  const server = schema.createServer(options, app.callback());

  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve();
    });
  });

  process.on('uncaughtException', (error) => {
    console.error(error);
    if (onError) {
      onError(error);
    }
    const killTimer = setTimeout(() => {
      process.exit(1);
    }, 3000);
    killTimer.unref();
  });

  return server;
};

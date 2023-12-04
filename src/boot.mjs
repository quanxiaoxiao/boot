import http from 'node:http';
import https from 'node:https';
import Koa from 'koa';
import connectMongo from './connectMongo.mjs';

export default async ({
  port,
  middlewares = [],
  cert,
  logger,
  mongo,
  ...other
}) => {
  if (mongo) {
    await connectMongo({
      ...mongo,
      logger,
    });
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

  const server = schema.createServer(options, app.callback);

  await new Promise((resolve) => {
    server.listen(port, () => {
      if (logger && logger.warn) {
        logger.warn(`server listen \`${port}\``);
      } else {
        console.log(`server listen \`${port}\``);
      }
      resolve();
    });
  });

  process.on('uncaughtException', (error) => {
    console.error(error);
    if (logger && logger.error) {
      logger.error(`boom ------------ ${error.message}`);
    }
    const killTimer = setTimeout(() => {
      process.exit(1);
    }, 3000);
    killTimer.unref();
  });

  return server;
};

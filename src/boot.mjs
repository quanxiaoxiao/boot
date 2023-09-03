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

  const server = cert && cert.key
    ? https.createServer({
      key: cert.key,
      cert: cert.cert,
    }, app.callback)
    : http.createServer({}, app.callback());

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
    if (logger) {
      logger.error(`boom ------------ ${error.message}`);
    }
    const killTimer = setTimeout(() => {
      process.exit(1);
    }, 3000);
    killTimer.unref();
  });

  return server;
};

import http from 'node:http';
import Koa from 'koa';
import connectMongo from './connectMongo.mjs';

export default async ({
  port,
  middlewares = [],
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

  if (logger) {
    app.use(async (ctx, next) => {
      const { method, path } = ctx;
      logger.info(`${ctx.headers['x-remote-address'] || ctx.ip} -> ${path}${ctx.querystring ? `?${decodeURIComponent(ctx.querystring)}` : ''} [${method}]`);
      ctx.logger = logger;
      try {
        await next();
      } catch (error) {
        if (error.statusCode >= 500) {
          logger.error(`${path} [${method}] \`${error.message}\``);
        }
        throw error;
      }
    });
  }

  middlewares.forEach((fn) => {
    app.use(fn);
  });

  const server = http.createServer({}, app.callback());

  server.listen(port, () => {
    if (logger && logger.warn) {
      logger.warn(`server listen at port: ${port}`);
    }
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
};

import http from 'node:http';
import https from 'node:https';
import Koa from 'koa';

/** @typedef {import('koa').Middleware} KoaMiddleware */
/** @typedef {import('http').Server} HttpServer}
/** @typedef {import('https').Server} HttpsServer}

/**
 * @typedef {Object} CertOptions
 * @property {Buffer} cert
 * @property {Buffer} key
 */

/**
 * @param {Object} options
 * @param {number} options.port
 * @param {Array<KoaMiddleware>} [options.middlewares = []]
 * @param {CertOptions} [options.cert]
 * @param {Function} [options.onError]
 * @returns {Promise<HttpServer|HttpsServer>}
 */
export default async ({
  port,
  middlewares = [],
  cert,
  onError,
  ...other
}) => {
  const app = new Koa();

  middlewares.forEach((fn) => {
    app.use(fn);
  });

  /**
   * @type {CertOptions}
  */
  const options = {};

  Object.assign(options, other);

  if (cert) {
    options.key = cert.key;
    options.cert = cert.cert;
  }

  const server = cert
    ? https.createServer(options, app.callback())
    : http.createServer(app.callback());

  /**
   * @returns {Promise<number>}
   */
  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve(port);
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

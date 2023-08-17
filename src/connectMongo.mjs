import mongoose from 'mongoose';

export default async ({
  logger,
  username,
  password,
  hostname,
  port,
  database,
}) => {
  const options = {};

  let uri;

  if (username && password) {
    options.authSource = 'admin';
    uri = `mongodb://${username}:${password}@${hostname}:${port}/${database}`;
  } else {
    uri = `mongodb://${hostname}:${port}/${database}`;
  }

  if (logger && typeof logger.warn === 'function') {
    logger.warn(`connect mongo ->- \`${uri}\``);
  }

  await new Promise((resolve, reject) => {
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, options, (error) => {
      if (error) {
        if (logger && typeof logger.error === 'function') {
          logger.error(`\`${uri}\` connect mongo fail, ${error.message}`);
        }
        reject(new Error(`connect mongo fail, \`${error.message}\``));
      } else {
        if (logger && typeof logger.warn === 'function') {
          logger.warn('mongo connect success');
        }
        resolve();
      }
    });
  });
};

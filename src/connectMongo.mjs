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
    logger.warn(`connect mongo -> \`${uri}\``);
  }

  await new Promise((resolve, reject) => {
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, options, (error) => {
      if (error) {
        if (logger) {
          logger.error(`connect mongo \`${uri}\` fail, ${error.message}`);
        }
        reject();
      } else {
        if (logger && typeof logger.warn === 'function') {
          logger.warn('mongo connect success');
        }
        resolve();
      }
    });
  });
};

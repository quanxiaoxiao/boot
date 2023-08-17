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
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, options);
  if (logger && typeof logger.warn === 'function') {
    logger.warn('mongo connect success');
  }
};

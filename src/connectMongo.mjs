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

  if (!database || database.trim() === '') {
    console.error('mongo database is not set');
    process.exit(1);
  }

  if (username && password) {
    options.authSource = 'admin';
    uri = `mongodb://${username}:${password}@${hostname}:${port}/${database}`;
  } else {
    uri = `mongodb://${hostname}:${port}/${database}`;
  }

  if (logger && typeof logger.warn === 'function') {
    logger.warn(`connect mongodb ->- \`${uri}\``);
  } else {
    console.log(`connect mongodb ->- \`${uri}\``);
  }
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, options);
  if (logger && typeof logger.warn === 'function') {
    logger.warn('mongodb connect success');
  }
};

import mongoose from 'mongoose';

export default async ({
  hostname = '127.0.0.1',
  port = 27017,
  username,
  password,
  database,
  onRequest,
  onConnect,
}) => {
  let uri;

  if (!database || database.trim() === '') {
    console.error('mongo database is not set');
    process.exit(1);
  }

  if (username && password) {
    uri = `mongodb://${username}:${password}@${hostname}:${port}/${database}`;
  } else {
    uri = `mongodb://${hostname}:${port}/${database}`;
  }
  if (onRequest) {
    await onRequest(uri);
  }

  mongoose.set('strictQuery', false);

  await mongoose.connect(uri);

  if (onConnect) {
    await onConnect(uri);
  }
};

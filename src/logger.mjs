import winston from 'winston';
import dayjs from 'dayjs';

export default ({
  level,
  fd1,
  fd2,
  format: loggerFormat,
}) => {
  const format = winston
    .format
    .printf((options) => {
      if (typeof loggerFormat === 'function') {
        return loggerFormat(options);
      }
      return `${dayjs().format('YYYY/MM/DD_HH:mm:ss')} [${options.level}]: ${options.message}`;
    });

  const logger = winston.createLogger({
    level,
    levels: {
      error: 0,
      warn: 1,
      info: 9,
    },
    format,
    transports: [
      new winston.transports.File({
        filename: fd1,
      }),
      new winston.transports.File({
        filename: fd2,
        level: 'error',
      }),
    ],
  });

  if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
      format,
    }));
  }
  return logger;
};

import winston from 'winston';
import dayjs from 'dayjs';

/**
 * @param {Object} options
 * @param {('info'|'warn'|'error')} [level="info"] options.level - logger output limit type
 * @param {string} options.fd1 - filename path, all info output
 * @param {string} options.fd2 - filename path, error output
 * @param {function} options.loggerFormat
 * @returns {Object} winston instance object
 */
export default ({
  level = 'info',
  fd1,
  fd2,
  format: loggerFormat,
}) => {
  const format = winston
    .format
    .printf((options) => {
      if (typeof loggerFormat === 'function') {
        return loggerFormat({
          level: options.level.toUpperCase(),
          message: options.message,
        });
      }
      return `[${options.level.toUpperCase()} ${dayjs().format('YYYY/MM/DD HH:mm:ss.SSS')}] ${options.message}`;
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

import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, printf, colorize } = winston.format;

// When you call logger.error('message', someError), winston stores the
// Error instance on info.error (and appends err.message to info.message).
// We pull the stack back out here so it actually shows up in the logs.
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, error, ...meta }) => {
    const errorLine = error instanceof Error ? `\n${error.stack}` : '';
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${rest}${errorLine}`;
  })
);

const prodFormat = combine(
  timestamp(),
  printf(({ level, message, timestamp, error, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(error instanceof Error ? { error: { message: error.message, stack: error.stack } } : {}),
      ...meta,
    });
  })
);

const logger = winston.createLogger({
  // npm levels: error < warn < info < http < verbose < debug < silly
  // 'http' in prod keeps request logs but drops debug noise; 'debug' in dev shows everything.
  level: config.nodeEnv === 'production' ? 'http' : 'debug',
  format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  silent: config.nodeEnv === 'test',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;

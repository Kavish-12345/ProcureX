import morgan from 'morgan';
import logger from '../lib/logger.js';

// Pipes morgan's Apache-style access log lines into winston at the 'http' level,
// so every request goes through the same transports (console + files) as the rest of the app.
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

const requestLogger = morgan('short', { stream });

export default requestLogger;

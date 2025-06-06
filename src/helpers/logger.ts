import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define the format for the logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info: Record<string, unknown>) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define the log file path
const logFile = path.join(process.cwd(), 'logs', 'app.log');

// Create the logger
const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports: [
    new winston.transports.File({
      filename: logFile,
    }),
  ],
});

export default logger;

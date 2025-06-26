import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Get log directory from environment variable or use default
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

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

// Define the log directory and file path
const logFile = path.join(LOG_DIR, 'app.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

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

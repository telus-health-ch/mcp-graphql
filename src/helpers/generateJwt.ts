import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import logger from './logger.js';

// Cache for the last generated token and its expiration
let lastToken: string | null = null;
let tokenExpiration: number | null = null;

export function generateJwt(): string | null {
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if we have a valid cached token with more than 20 seconds until expiration
  if (lastToken && tokenExpiration && tokenExpiration > currentTime + 20) {
    logger.debug('Using cached JWT token');
    return lastToken;
  }
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;

  if (!privateKeyPath) {
    logger.error("Error: PRIVATE_KEY_PATH environment variable is not set");
    return null;
  }

  try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const currentTime = Math.floor(Date.now() / 1000);
    const payload = {
      iat: currentTime,
      exp: currentTime + 240 // 4 minutes (must be less than 5 minutes)
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    // Cache the token and its expiration time
    lastToken = token;
    tokenExpiration = currentTime + 240; // 4 minutes from now
    logger.debug('New JWT token generated successfully');
    return token;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.error(`Error: Private key file not found at ${privateKeyPath}`);
      } else if (error.name === 'JsonWebTokenError') {
        logger.error("Error: Invalid private key format");
      } else {
        logger.error(`Error generating JWT: ${error.message}`);
      }
    } else {
      logger.error("An unknown error occurred");
    }
    return null;
  }
}

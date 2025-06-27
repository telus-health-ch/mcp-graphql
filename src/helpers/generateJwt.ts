import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import logger from './logger.js';

// Define allowed JWT algorithms
type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'PS256' | 'PS384' | 'PS512' | 'none';

// Define the JWT configuration interface
export interface JwtConfiguration {
  enabled: boolean;
  type?: 'external' | 'generated';
  
  // For external tokens
  access_token?: string;
  
  // For generated tokens
  private_key_path?: string;
  iss?: string;
  algorithm?: JwtAlgorithm;
}

// Cache for the last generated token and its expiration
let lastToken: string | null = null;
let tokenExpiration: number | null = null;

export function generateJwt(jwtConfig?: JwtConfiguration): string | null {
  // If JWT configuration is not provided or not enabled, return null
  if (!jwtConfig || !jwtConfig.enabled) {
    logger.debug('JWT generation is disabled or not configured');
    return null;
  }

  // Handle external token type
  if (jwtConfig.type === 'external') {
    if (jwtConfig.access_token) {
      logger.debug('Using external JWT token');
      return jwtConfig.access_token;
    }
    logger.error('External JWT type specified but no access_token provided');
    return null;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if we have a valid cached token with more than 20 seconds until expiration
  if (lastToken && tokenExpiration && tokenExpiration > currentTime + 20) {
    logger.debug('Using cached JWT token');
    return lastToken;
  }

  const privateKeyPath = jwtConfig.private_key_path;

  if (!privateKeyPath) {
    logger.error("Error: private_key_path is not set in JWT configuration");
    return null;
  }

  try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Create the payload with required claims
    const payload: Record<string, any> = {
      iat: currentTime,
      exp: currentTime + 240 // 4 minutes (must be less than 5 minutes)
    };
    
    // Add issuer if provided in the configuration
    if (jwtConfig.iss) {
      payload.iss = jwtConfig.iss;
    }

    // Use algorithm from config or default to RS256
    const algorithm = jwtConfig.algorithm || 'RS256';
    const token = jwt.sign(payload, privateKey, { algorithm: algorithm as jwt.Algorithm });
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

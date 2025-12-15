import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'; // 7 days default

export interface TokenPayload {
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token with expiration
 */
export function generateToken(username: string): string {
  const payload: TokenPayload = {
    username,
  };

  const token = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRATION,
  } as jwt.SignOptions);

  return token;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

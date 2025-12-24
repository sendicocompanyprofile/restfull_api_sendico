import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

interface TokenPayload {
  username: string;
  is_admin: boolean;
  iat?: number;
  exp?: number;
}

// Test generateToken
function generateToken(username: string, is_admin: boolean = false): string {
  console.log('🔧 Generating token with:');
  console.log(`  - username: ${username}`);
  console.log(`  - is_admin: ${is_admin}`);
  console.log(`  - JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`  - JWT_EXPIRATION: ${JWT_EXPIRATION}`);

  const payload: TokenPayload = {
    username,
    is_admin,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  } as jwt.SignOptions);

  console.log('✅ Token generated successfully');
  console.log(`✅ Token length: ${token.length}`);
  console.log(`✅ Token preview: ${token.substring(0, 50)}...`);

  return token;
}

// Test verifyToken
function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    console.log('✅ Token verified successfully');
    console.log(`  - username: ${decoded.username}`);
    console.log(`  - is_admin: ${decoded.is_admin}`);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Run tests
console.log('\n═══════════════════════════════════════════════════════════');
console.log('🧪 JWT Token Generator Test');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Generate token for admin user
console.log('Test 1: Generate token for ADMIN user');
console.log('───────────────────────────────────────');
const adminToken = generateToken('superadmin', true);
console.log(`🎫 Token:\n${adminToken}\n`);

// Test 2: Generate token for regular user
console.log('\nTest 2: Generate token for REGULAR user');
console.log('───────────────────────────────────────');
const userToken = generateToken('testuser', false);
console.log(`🎫 Token:\n${userToken}\n`);

// Test 3: Verify admin token
console.log('\nTest 3: Verify ADMIN token');
console.log('───────────────────────────────────────');
verifyToken(adminToken);

// Test 4: Verify regular token
console.log('\n\nTest 4: Verify REGULAR token');
console.log('───────────────────────────────────────');
verifyToken(userToken);

// Test 5: Try to verify with wrong token
console.log('\n\nTest 5: Try to verify INVALID token');
console.log('───────────────────────────────────────');
verifyToken('invalid.token.here');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ Tests Complete');
console.log('═══════════════════════════════════════════════════════════\n');

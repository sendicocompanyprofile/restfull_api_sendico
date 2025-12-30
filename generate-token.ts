import jwt from 'jsonwebtoken';

// Konfigurasi JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

interface TokenPayload {
  username: string;
  is_admin: boolean;
}

function generateToken(username: string, is_admin: boolean = false): string {
  const payload: TokenPayload = {
    username,
    is_admin,
  };

  const token = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRATION,
  });

  return token;
}

// Get username dari command line argument
const username = process.argv[2] || 'test1';
const isAdmin = process.argv[3] === 'true' ? true : false;

try {
  console.log(`🔄 Generating token untuk user: ${username}`);
  const token = generateToken(username, isAdmin);
  
  console.log(`✅ Token berhasil di-generate!`);
  console.log(`\n📋 User: ${username}`);
  console.log(`👮 Is Admin: ${isAdmin}`);
  console.log(`\n🔑 Token (copy untuk authorization):`);
  console.log(token);
  console.log(`\n💡 Gunakan token ini untuk request authorization:`);
  console.log(`\nHeader Option 1:`);
  console.log(`Authorization: Bearer ${token}`);
  console.log(`\nHeader Option 2:`);
  console.log(`X-API-TOKEN: ${token}`);
  
  console.log(`\n📝 SQL untuk update user di database:`);
  console.log(`UPDATE \`User\` SET \`token\` = '${token}' WHERE \`username\` = '${username}';`);
} catch (error) {
  console.error('❌ Error generating token:', error);
}

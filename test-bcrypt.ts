import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function test() {
  const plainPassword = 'password123';
  
  // Hash it
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  console.log('Hashed:', hashed);
  console.log('Hashed length:', hashed.length);
  
  // Compare it
  const isValid = await bcrypt.compare(plainPassword, hashed);
  console.log('Is valid:', isValid);
}

test().catch(console.error);

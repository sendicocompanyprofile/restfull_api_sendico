import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const password = 'test2711';

async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Password yang akan di-hash:', password);
    console.log('Bcrypt hash hasil:');
    console.log(hashedPassword);
  } catch (error) {
    console.error('Error:', error);
  }
}

hashPassword();

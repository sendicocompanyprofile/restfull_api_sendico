import bcrypt from 'bcrypt';
async function generateHash() {
    const password = 'agung2711';
    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const createdAt = now.toISOString().slice(0, 19).replace('T', ' ');
    console.log('\n📝 SQL INSERT Statement:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nINSERT INTO "User" (username, password, name, is_admin, createdAt) VALUES (`);
    console.log(`  'agung',`);
    console.log(`  '${hash}',`);
    console.log(`  'Agung Admin',`);
    console.log(`  true,`);
    console.log(`  '${createdAt}'`);
    console.log(`);`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Credentials:');
    console.log('  Username: agung');
    console.log('  Password: agung2711');
    console.log('  Is Admin: true');
    console.log('  Is Active: true');
    console.log('\n');
}
generateHash();

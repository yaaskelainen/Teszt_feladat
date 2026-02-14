const { execSync } = require('child_process');
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/db';
try {
    console.log('Running prisma generate...');
    const output = execSync('npx prisma generate', { encoding: 'utf-8' });
    console.log(output);
} catch (error) {
    console.error('Error during prisma generate:');
    console.error(error.stdout);
    console.error(error.stderr);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to switch Prisma datasource to Supabase Postgres and load all data.
 * Usage: node load-to-supabase.js "<DB_PASSWORD>" [REGION]
 * Or set DATABASE_URL and DIRECT_URL in .env before running.
 */

const envPath = path.join(__dirname, '.env');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

const projectRef = 'yvwirgxhufregpjksgkr';
const dbPassword = process.argv[2];
const region = process.argv[3] || 'ap-south-1'; // Default AWS region for India / Pune

console.log('================================================================');
console.log('🚀 SAHAKARSEVA — SUPABASE POSTGRES DATA LOADER');
console.log(`Project Reference: ${projectRef}`);
console.log('================================================================\n');

if (dbPassword) {
  console.log('1. Configuring .env with provided Supabase password...');
  const pooledUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const directUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;

  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${pooledUrl}"`);
  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `\nDIRECT_URL="${directUrl}"\n`;
  } else {
    envContent = envContent.replace(/DIRECT_URL=.*/g, `DIRECT_URL="${directUrl}"`);
  }
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ .env updated with Supabase pooled & direct URLs.\n');
}

console.log('2. Updating Prisma schema datasource to PostgreSQL...');
let schema = fs.readFileSync(schemaPath, 'utf8');
schema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`
);
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ prisma/schema.prisma configured for PostgreSQL (url + directUrl).\n');

try {
  console.log('3. Running Prisma db push to create all 11 tables in Supabase Postgres...');
  execSync('npx prisma db push', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Tables created in Supabase.\n');

  console.log('4. Seeding data (Cooperative, Categories, 15 Workers, Customers, Admin)...');
  execSync('node prisma/seed.js', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ All data successfully loaded into Supabase!\n');
} catch (err) {
  console.error('\n❌ Error pushing schema or seeding to Supabase:', err.message);
  process.exit(1);
}

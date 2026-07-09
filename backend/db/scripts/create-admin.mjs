// Seed/create an admin user with a bcrypt-hashed password.
//
// Usage:
//   node scripts/create-admin.mjs [email] [password] [name] [role]
//
// Defaults: admin@helpr.com / helpr@123 / "Admin" / super_admin
// DB connection is read from env vars (falls back to the same defaults as src/lib/mysql.ts).

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load .env.local manually (no dotenv dependency required).
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = join(__dirname, '..', '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // No .env.local; rely on process env / defaults.
}

const email = (process.argv[2] || 'admin@helpr.com').trim().toLowerCase();
const password = process.argv[3] || 'helpr@123';
const name = process.argv[4] || 'Admin';
const role = process.argv[5] || 'super_admin';

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root123',
    database: process.env.MYSQL_DATABASE || 'urban_service',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      await pool.query(
        'UPDATE users SET name = ?, password_hash = ?, role = ?, status = ? WHERE email = ?',
        [name, passwordHash, role, 'active', email]
      );
      console.log(`Updated existing user "${email}" -> role=${role}, status=active`);
    } else {
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status, joined) VALUES (?, ?, ?, ?, ?, CURDATE())',
        [name, email, passwordHash, role, 'active']
      );
      console.log(`Created admin user "${email}" with role=${role}`);
    }

    console.log('Done. You can now log in at /login with:');
    console.log(`  email:    ${email}`);
    console.log(`  password: ${password}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});

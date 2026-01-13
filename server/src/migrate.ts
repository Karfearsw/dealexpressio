import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

async function main() {
    console.log('Running migrations...');
    // Use path relative to the project root, works for both dev (ts-node) and prod (compiled)
    const migrationsFolder = path.resolve(__dirname, '../drizzle');
    console.log('Migrations folder:', migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully!');
    await pool.end();
}

main().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
});

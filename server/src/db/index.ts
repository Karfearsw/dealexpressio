import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import pg from 'pg';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

let pool: pg.Pool | undefined;
let db: any;

if (process.env.DB_DRIVER === 'neon_http') {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzleNeon(sql, { schema });
    
    // Even with HTTP driver, we need a Pool for connect-pg-simple sessions
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    db = drizzlePg(pool, { schema });
}

export { db, pool };

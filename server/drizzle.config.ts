import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    strict: false,
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        ssl: process.env.DATABASE_SSL === 'true' ? 'require' : false,
    },
});

import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('Seeding database...');

    const email = 'test@example.com';
    const password = 'Password123!';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    try {
        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        
        if (existingUser.length > 0) {
            console.log('Test user already exists.');
            // Update password just in case
            await db.update(users)
                .set({ passwordHash })
                .where(eq(users.email, email));
            console.log('Updated test user password.');
        } else {
            // Create user
            await db.insert(users).values({
                email,
                passwordHash,
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
                twoFactorEnabled: false,
            });
            console.log('Test user created successfully.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        console.log('Seeding complete.');
        process.exit(0);
    }
}

seed();

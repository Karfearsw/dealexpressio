
const API_URL = 'http://localhost:3000/api/auth/register';

const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User'
};

async function runTest() {
    console.log('--- Starting Registration Test ---');
    console.log(`Target: ${API_URL}`);
    console.log(`User: ${testUser.email}`);

    // 1. First Registration (Should succeed)
    try {
        console.log('\n1. Attempting initial registration...');
        const res1 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        console.log(`[SUCCESS] Status: ${res1.status}`);
        const data1 = await res1.json();
        
        if (res1.status === 201) {
            console.log('User registered successfully.');
        } else {
            console.error('Unexpected status code:', res1.status);
            console.error('Response:', data1);
        }
    } catch (error: any) {
        console.error('[FAILURE] Registration failed:', error.message);
        process.exit(1);
    }

    // 2. Second Registration (Should fail with 409)
    try {
        console.log('\n2. Attempting duplicate registration (should fail)...');
        const res2 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (res2.status === 409) {
            const data2 = await res2.json() as any;
            console.log(`[SUCCESS] Caught expected 409 Conflict: ${data2.message}`);
        } else {
            console.error(`[FAILURE] Unexpected status: ${res2.status}`);
            const text = await res2.text();
            console.error('Response:', text);
        }
    } catch (error: any) {
         console.error(`[FAILURE] Unexpected error: ${error.message}`);
    }

    console.log('\n--- Test Complete ---');
}

runTest();

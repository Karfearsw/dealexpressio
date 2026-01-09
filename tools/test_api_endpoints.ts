import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';
let cookie = '';

async function runTests() {
    console.log('--- Starting Functional Tests ---');

    try {
        // 1. Register
        console.log('\n1. Registering new user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            firstName: 'Test',
            lastName: 'User',
            subscriptionTier: 'pro' // Need pro for imports
        });
        if (regRes.status === 201) console.log('✅ Registration successful');
        
        // 2. Login
        console.log('\n2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        if (loginRes.status === 200) {
            console.log('✅ Login successful');
            const setCookie = loginRes.headers['set-cookie'];
            if (setCookie) {
                cookie = setCookie[0];
                console.log('✅ Session cookie received');
            } else {
                console.warn('⚠️ No session cookie received');
            }
        }

        // 3. Test Leads Import (File Upload)
        console.log('\n3. Testing Leads Import (File Upload)...');
        const csvContent = 'firstName,lastName,email,phone\nJohn,Doe,john@example.com,1234567890';
        const filePath = path.join(__dirname, 'test_leads.csv');
        fs.writeFileSync(filePath, csvContent);

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const importRes = await axios.post(`${API_URL}/leads/import`, form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': cookie
            }
        });
        
        if (importRes.status === 200) {
            console.log('✅ Leads import successful:', importRes.data.message);
        }
        fs.unlinkSync(filePath);

        // 4. Test Deals (Properties) Import
        console.log('\n4. Testing Deals Import (File Upload)...');
        const dealsCsvContent = 'leadId,address,city,state,zip\n1,123 Main St,Anytown,CA,90210';
        const dealsFilePath = path.join(__dirname, 'test_deals.csv');
        fs.writeFileSync(dealsFilePath, dealsCsvContent);

        const dealsForm = new FormData();
        dealsForm.append('file', fs.createReadStream(dealsFilePath));

        const dealsRes = await axios.post(`${API_URL}/deals/import`, dealsForm, {
             headers: {
                ...dealsForm.getHeaders(),
                'Cookie': cookie
            }
        });

        if (dealsRes.status === 200) {
             console.log('✅ Deals import successful:', dealsRes.data.message);
        }
        fs.unlinkSync(dealsFilePath);

    } catch (error: any) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }

    console.log('\n--- All Tests Passed ---');
}

runTests();
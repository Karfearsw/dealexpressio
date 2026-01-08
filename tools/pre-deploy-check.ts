
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

interface Check {
    name: string;
    test: () => Promise<boolean>;
}

async function runCommand(command: string): Promise<boolean> {
    try {
        await execAsync(command);
        return true;
    } catch (error) {
        return false;
    }
}

async function preDeployCheck() {
    console.log('🔍 Running pre-deploy checks...\n');

    const checks: Check[] = [
        { name: 'Build compiles (client)', test: () => runCommand('npm --prefix client run build') },
        { name: 'Build compiles (server)', test: () => runCommand('npm --prefix server run build') },
        // Add more sophisticated checks here, e.g., using Puppeteer/Playwright to test page loads
        // For now, we'll stick to build verification which would have caught the missing import
    ];

    for (const check of checks) {
        process.stdout.write(`${check.name}... `);
        const passed = await check.test();
        console.log(passed ? '✅' : '❌');
        if (!passed) {
            console.error(`\n❌ DEPLOY BLOCKED: ${check.name} failed\n`);
            process.exit(1);
        }
    }

    console.log('\n✅ All checks passed! Safe to deploy.\n');
}

preDeployCheck();

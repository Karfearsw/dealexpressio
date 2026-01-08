const { spawn } = require('child_process');

function run(name, cmd, args) {
  console.log(`[${name}] starting: ${cmd} ${args.join(' ')}`);
  const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });
  proc.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
  return proc;
}

const server = run('server', 'npm', ['--prefix', 'server', 'run', 'dev']);
const client = run('client', 'npm', ['--prefix', 'client', 'run', 'dev']);

process.on('SIGINT', () => {
  console.log('Shutting down dev processes...');
  try { server.kill('SIGINT'); } catch {}
  try { client.kill('SIGINT'); } catch {}
  process.exit(0);
});

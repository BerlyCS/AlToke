import { spawn } from 'node:child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: bun run scripts/run-lint-non-blocking.mjs <command>');
  process.exit(1);
}

const command = args.join(' ');

const child = spawn(command, {
  shell: true,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Failed to start lint command: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Lint command exited with signal ${signal}.`);
    process.exit(1);
  }

  if (code && code !== 0) {
    console.warn('Lint findings detected. Continuing because lint is non-blocking for this repository.');
  }

  process.exit(0);
});

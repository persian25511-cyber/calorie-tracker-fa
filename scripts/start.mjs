import { spawn } from 'node:child_process'

const requested = process.env.PORT ?? '4173'
if (!/^\d+$/.test(requested)) {
  console.error('PORT must be a numeric value')
  process.exit(1)
}

// `shell: true` makes this work on both Windows (cmd) and Railway (Linux).
const child = spawn(`npx vite preview --host 0.0.0.0 --port ${requested}`, {
  shell: true,
  stdio: 'inherit',
})
child.on('exit', (code) => process.exit(code ?? 0))

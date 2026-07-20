import { existsSync, rmSync, renameSync } from 'node:fs';

const dist = new URL('../dist', import.meta.url);
const docs = new URL('../docs', import.meta.url);

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

rmSync(docs, { recursive: true, force: true });
renameSync(dist, docs);

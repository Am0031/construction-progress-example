import { rmSync } from 'node:fs';

rmSync(new URL('../docs', import.meta.url), { recursive: true, force: true });

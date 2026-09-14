import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServer)) {
  // Built production bundle exists (from npm run build)
  await import('./dist/server.cjs');
} else {
  // Direct execution with TypeScript runtime (Node 22+ / tsx)
  try {
    await import('./server.ts');
  } catch (err) {
    console.error('Failed to load server.ts:', err);
    process.exit(1);
  }
}

import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { phase2ArtifactPath, phase2ArtifactRelativePath } from './phase2-dashboard-artifact-paths.mjs';

try {
  await access(phase2ArtifactPath, constants.R_OK);
} catch {
  console.error(
    `Missing phase2 dashboard artifact at ${phase2ArtifactRelativePath}. Run "npm run generate:phase2-artifact" first.`,
  );
  process.exit(1);
}

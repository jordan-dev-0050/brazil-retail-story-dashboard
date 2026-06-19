import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const phase2ArtifactRelativePath = path.join(
  'data',
  'public',
  'dashboard-artifacts',
  'phase2DashboardArtifact.json',
);
export const phase2ArtifactPath = path.join(projectRoot, phase2ArtifactRelativePath);

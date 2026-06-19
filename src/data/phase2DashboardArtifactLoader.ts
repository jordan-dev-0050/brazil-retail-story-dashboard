import type { Phase2DashboardArtifact } from './phase2DashboardTypes';

export const PHASE2_DASHBOARD_ARTIFACT_URL = `${import.meta.env.BASE_URL}dashboard-artifacts/phase2DashboardArtifact.json`;

export async function loadPhase2DashboardArtifact(): Promise<Phase2DashboardArtifact> {
  const response = await fetch(PHASE2_DASHBOARD_ARTIFACT_URL, {
    cache: import.meta.env.DEV ? 'no-store' : 'default',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load phase2 dashboard artifact from ${PHASE2_DASHBOARD_ARTIFACT_URL} (${response.status})`,
    );
  }

  return (await response.json()) as Phase2DashboardArtifact;
}

# Real-Data Integration UI Guardrails

Purpose: keep the dashboard UI shape stable while real data is introduced in phases.

## Guardrails

- Default to swapping the data source first; do not remove panels, filters, tabs, or KPI slots unless the spec explicitly allows it.
- If real data covers only part of the dashboard, prefer a hybrid UI and keep unfinished areas mock-backed instead of shrinking the interface.
- Any structural UI change, such as fewer KPI cards, disabled filters, or removed chart series, must be called out in the implementation doc with reason and impact.
- Capture a baseline screenshot before each real-data phase and compare it again after the phase is complete.
- If a section is still mock-backed, document that status clearly and do not describe it as fully real-backed.

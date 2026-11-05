# Implementation Plan: Real-Time Status Monitoring

## 1. Objective
Enable real-time, production-grade status monitoring for Telegram bots and websites with a 15-minute polling interval and immediate failure detection via webhook callbacks.

## 2. Technical Approach
- **Telegram Bot Health**: Use a periodic background worker (15m interval) to call `getWebhookInfo`. If the Telegram API returns a non-zero `last_error_message` or a failed webhook status, the bot will be instantly marked `OFFLINE`.
- **Website Health**: Use a background worker (15m interval) to perform a `fetch` (HEAD request) to the registered URLs. Any non-200 status code will result in an immediate `OFFLINE` status.
- **Monitoring Infrastructure**: Implement a new `HealthCheckService` in `src/lib/healthcheck.ts` to coordinate these background tasks.
- **UI Updates**:
    - `OverviewView.tsx`: Update to reflect the new real-time status.
    - `TelegramBotsView.tsx`: Add a "Refresh Status" button for manual overrides.
    - `WebAppsView.tsx`: Add a "Refresh Status" button for manual overrides.

## 3. Implementation Steps
1.  Create/update `src/lib/healthcheck.ts` with real `fetch` logic for polling.
2.  Update `src/lib/store.ts` to include a `syncStatus` function that runs on a timer (15 min).
3.  Ensure `TelegramBotsView` and `WebAppsView` show the most recent `lastCheck` timestamp and status fetched by the store.
4.  Verify performance and ensure no UI flickering during updates.

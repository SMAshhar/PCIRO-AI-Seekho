import {crisisApi} from './crisisApi';
import {CrisisEvent} from '../types/models';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * After POST /api/reports the server processes in a background task.
 * Poll until the crisis exists or timeout.
 */
export async function waitForCrisisAfterReport(
  eventId: string,
  options: {maxAttempts?: number; intervalMs?: number} = {},
): Promise<CrisisEvent | undefined> {
  const maxAttempts = options.maxAttempts ?? 30;
  const intervalMs = options.intervalMs ?? 500;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const crisis = await crisisApi.getCrisisById(eventId);
      if (crisis) {
        return crisis;
      }
    } catch {
      // 404 while still processing
    }
    await sleep(intervalMs);
  }
  return undefined;
}

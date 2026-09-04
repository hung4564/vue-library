import { WorkerMonitor } from '@hungpvq/map-core';
import type {
  SampleWorkerRequest,
  SampleWorkerResponse,
} from './sample.worker';

export const SAMPLE_WORKER_ID = 'sample';

const sampleWorker = WorkerMonitor.connect<
  SampleWorkerRequest,
  SampleWorkerResponse
>({
  id: SAMPLE_WORKER_ID,
  name: 'Sample',
  createWorker: () =>
    new Worker(new URL('./sample.worker.ts', import.meta.url), {
      type: 'module',
    }),
});

function sumRangeMain(from: number, to: number): number {
  let sum = 0;
  for (let i = from; i <= to; i++) sum += i;
  return sum;
}

/** Run a monitored sum-range task (worker + main-thread fallback). */
export async function runSampleSumRange(
  from: number,
  to: number,
): Promise<number> {
  return sampleWorker.runTask(
    'sum-range',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await sampleWorker.post({
          id: taskId,
          type: 'sum-range',
          from,
          to,
        });
        if (!response.ok) {
          throw new Error(response.error || 'Sample worker failed');
        }
        return response.sum ?? 0;
      },
    },
    {
      engine: 'main',
      run: async () => sumRangeMain(from, to),
    },
  );
}

export function terminateSampleWorker() {
  sampleWorker.terminate('Sample worker terminated');
}

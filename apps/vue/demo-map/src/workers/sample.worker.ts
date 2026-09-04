// Do NOT import from `@hungpvq/map-core` here — the package entry pulls in
// CSS / DOM code and will crash the worker. Use the in-worker entry only.
import { runWorkerMonitor } from '@hungpvq/map-core/worker';

export type SampleWorkerRequest = {
  id: string;
  type: 'sum-range';
  from: number;
  to: number;
};

export type SampleWorkerResponse = {
  id: string;
  ok: boolean;
  sum?: number;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runWorkerMonitor<SampleWorkerRequest>(
  async (message, ctx) => {
    if (message.type !== 'sum-range') {
      throw new Error(`Unknown sample worker task: ${message.type}`);
    }

    const from = Number(message.from);
    const to = Number(message.to);

    if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
      throw new Error('Invalid range: need finite from <= to');
    }

    const total = to - from + 1;

    ctx.log(
      `[sum-range] START from=${from}, to=${to}, total=${total.toLocaleString()}`,
    );

    console.info('[sample-worker] console.info (no taskId)', {
      from,
      to,
      total,
    });

    let sum = 0;

    // Log mỗi 10.000 bước
    const LOG_INTERVAL = 10_000;

    // Thời gian bắt đầu
    const startTime = performance.now();

    for (let i = from; i <= to; i++) {
      sum += i;

      const current = i - from + 1;

      // Log:
      // - bước đầu tiên
      // - mỗi 10.000 bước
      // - bước cuối cùng
      if (current === 1 || current % LOG_INTERVAL === 0 || current === total) {
        const elapsed = performance.now() - startTime;
        const percent = (current / total) * 100;

        // Tốc độ xử lý
        const speed = elapsed > 0 ? current / (elapsed / 1000) : 0;

        // Ước tính thời gian còn lại
        const remaining = speed > 0 ? (total - current) / speed : 0;

        ctx.log(
          `[sum-range] ` +
            `progress=${current.toLocaleString()}/${total.toLocaleString()} ` +
            `(${percent.toFixed(2)}%) ` +
            `sum=${sum.toLocaleString()} ` +
            `speed=${Math.round(speed).toLocaleString()} step/s ` +
            `elapsed=${(elapsed / 1000).toFixed(2)}s ` +
            `remaining=${remaining.toFixed(2)}s`,
        );

        ctx.report(
          current,
          total,
          `summing ${current.toLocaleString()}/${total.toLocaleString()}`,
        );

        // Nhường event loop để worker monitor / message có thể xử lý
        await sleep(0);
      }
    }

    const elapsed = performance.now() - startTime;

    ctx.log(
      `[sum-range] DONE ` +
        `total=${total.toLocaleString()} ` +
        `sum=${sum.toLocaleString()} ` +
        `elapsed=${(elapsed / 1000).toFixed(2)}s`,
    );

    return { sum };
  },
  {
    readyMessage: 'Sample worker ready',
  },
);

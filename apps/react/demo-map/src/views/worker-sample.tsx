import {
  BaseMapControl,
  HomeControl,
  Map,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import {
  runSampleSumRange,
  terminateSampleWorker,
} from '../workers/sample-worker.client';
import './worker-sample.css';

export function WorkerSamplePage() {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(200_000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      terminateSampleWorker();
    };
  }, []);

  async function onRun() {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      setResult(await runSampleSumRange(from, to));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <MapPageShell>
      <Map>
        <AsideControl position="top-left" />
        <WorkerControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <ZoomControl />
        <HomeControl />
      </Map>

      <div className="sample-worker-panel">
        <h3>Sample worker</h3>
        <p>
          Open <strong>Workers</strong> (left), then run a sum task. Watch
          progress, task logs, and the shared worker log.
        </p>
        <label>
          From
          <input
            type="number"
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
          />
        </label>
        <label>
          To
          <input
            type="number"
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
          />
        </label>
        <button type="button" disabled={running} onClick={() => void onRun()}>
          {running ? 'Running…' : 'Run sum-range'}
        </button>
        {result != null ? (
          <p className="sample-worker-panel__result">Result: {result}</p>
        ) : null}
        {error ? <p className="sample-worker-panel__error">{error}</p> : null}
      </div>
    </MapPageShell>
  );
}

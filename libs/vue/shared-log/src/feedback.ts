export type ActionFeedbackPhase = 'idle' | 'loading' | 'success' | 'error';

export async function runWithPhase(
  setPhase: (phase: ActionFeedbackPhase) => void,
  work: () => void | Promise<void>,
): Promise<void> {
  setPhase('loading');
  try {
    await work();
    setPhase('success');
  } catch {
    setPhase('error');
  }
  setTimeout(() => setPhase('idle'), 1500);
}

export function phaseLabel(
  phase: ActionFeedbackPhase,
  idle: string,
): string {
  if (phase === 'loading') return '…';
  if (phase === 'success') return 'Refreshed';
  if (phase === 'error') return 'Failed';
  return idle;
}

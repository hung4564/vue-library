import { DevtoolsShell } from '@hungpvq/react-shared-log';

export function DevtoolsPanelBody({
  showClose,
  onClose,
}: {
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <DevtoolsShell
      showClose={showClose}
      onClose={onClose}
    />
  );
}

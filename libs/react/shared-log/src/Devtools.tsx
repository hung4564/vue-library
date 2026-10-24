import { registerBuiltinDebugTabs } from './register-builtin';
import { DevtoolsShell } from './DevtoolsShell';
import { useDebugHost } from './use-debug-host';

registerBuiltinDebugTabs();

export function Devtools() {
  const { host, isOpen } = useDebugHost();
  if (!isOpen) return null;
  return (
    <div className="debug-overlay">
      <div className="debug-overlay__panel">
        <DevtoolsShell
          showClose
          onClose={() => host.setOpen(false)}
        />
      </div>
    </div>
  );
}

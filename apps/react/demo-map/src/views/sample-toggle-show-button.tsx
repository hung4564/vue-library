import { BaseButton } from '@hungpvq/react-map-core';

export function SampleToggleShowButton({
  show,
  disabled,
  title,
  onToggle,
}: {
  show: boolean;
  disabled?: boolean;
  title: string;
  onToggle: () => void;
}) {
  return (
    <BaseButton
      disabled={disabled}
      title={title}
      active={show}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {show ? 'ON' : 'OFF'}
      </span>
    </BaseButton>
  );
}

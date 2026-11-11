type MonveMarkProps = { className?: string };

export function MonveMark({ className }: MonveMarkProps) {
  return <img className={className} src="/monve-mark.png" alt="" aria-hidden="true" decoding="async" />;
}

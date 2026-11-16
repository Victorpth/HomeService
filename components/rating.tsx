export function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-medium text-navy"
      aria-label={`${value} out of 5`}
    >
      <span className="text-copper" aria-hidden="true">
        ★
      </span>
      {value.toFixed(1)}
    </span>
  );
}

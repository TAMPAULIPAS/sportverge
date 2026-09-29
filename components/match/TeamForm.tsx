// TODO: TeamForm.tsx
export default function Component() {
  return null;
}
// ═══════════════════════════════════════════════════════════════
//  TeamForm — გუნდის ფორმა (ბოლო 5 მატჩის შედეგი)
//  W = მოგება (მწვანე), D = ფრე (ოქრო), L = წაგება (წითელი)
// ═══════════════════════════════════════════════════════════════

interface TeamFormProps {
  form: ('W' | 'D' | 'L')[];
  size?: 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
}

const sizes = {
  sm: {
    dot: 'w-4 h-4 text-[9px]',
    gap: 'gap-1',
    label: 'text-[10px]',
  },
  md: {
    dot: 'w-6 h-6 text-xs',
    gap: 'gap-1.5',
    label: 'text-xs',
  },
};

const colors = {
  W: 'bg-success text-ink',
  D: 'bg-gold text-ink',
  L: 'bg-danger text-ink',
};

export function TeamForm({
  form,
  size = 'sm',
  className = '',
  showLabel = false,
}: TeamFormProps) {
  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {showLabel && (
        <span className={`${s.label} text-muted uppercase tracking-wider`}>
          Form
        </span>
      )}
      <div className={`flex ${s.gap}`}>
        {form.map((result, i) => (
          <span
            key={i}
            className={`${s.dot} rounded-full flex items-center justify-center font-bold ${colors[result]}`}
            aria-label={result}
            title={result === 'W' ? 'მოგება' : result === 'D' ? 'ფრე' : 'წაგება'}
          >
            {result}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TeamForm;

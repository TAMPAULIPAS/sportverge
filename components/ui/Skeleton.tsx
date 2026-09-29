import { cn } from '@/lib/utils';

type Variant = 'text' | 'circle' | 'rect' | 'card';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

function SkeletonBase({
  className,
  style,
  animated = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  return (
    <div
      className={cn(
        'bg-surface-hover rounded-lg',
        animated && 'animate-pulse',
        className
      )}
      style={style}
      {...props}
    />
  );
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  animated = true,
  className,
  ...props
}: SkeletonProps) {
  // ─── TEXT (რამდენიმე ხაზი) ───
  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            animated={animated}
            className="h-3"
            style={{
              width: i === lines - 1 && lines > 1 ? '70%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  // ─── CIRCLE (avatar, logo) ───
  if (variant === 'circle') {
    return (
      <SkeletonBase
        animated={animated}
        className={cn('rounded-full', className)}
        style={{
          width: width || 48,
          height: height || width || 48,
        }}
        {...props}
      />
    );
  }

  // ─── CARD (ბარათის ჩონჩხი) ───
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'bg-surface/60 border border-edge rounded-2xl p-5 space-y-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <SkeletonBase animated={animated} className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase animated={animated} className="h-3 w-1/2" />
            <SkeletonBase animated={animated} className="h-2 w-1/3" />
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonBase animated={animated} className="h-3 w-full" />
          <SkeletonBase animated={animated} className="h-3 w-5/6" />
          <SkeletonBase animated={animated} className="h-3 w-2/3" />
        </div>

        <div className="flex gap-2 pt-2 border-t border-edge/50">
          <SkeletonBase animated={animated} className="h-8 w-20" />
          <SkeletonBase animated={animated} className="h-8 w-20" />
        </div>
      </div>
    );
  }

  // ─── DEFAULT RECT ───
  return (
    <SkeletonBase
      animated={animated}
      className={className}
      style={{
        width: width || '100%',
        height: height || 16,
        ...props.style,
      }}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────
// SkeletonMatchCard — მატჩის ბარათის ჩონჩხი
// ─────────────────────────────────────────────
export function SkeletonMatchCard({ animated = true }: { animated?: boolean }) {
  return (
    <div className="bg-surface/60 border border-edge rounded-2xl p-5">
      <SkeletonBase animated={animated} className="h-2 w-32 mb-4" />
      <div className="grid grid-cols-3 items-center gap-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <SkeletonBase animated={animated} className="w-16 h-16 rounded-full" />
          <SkeletonBase animated={animated} className="h-3 w-20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <SkeletonBase animated={animated} className="h-10 w-24" />
          <SkeletonBase animated={animated} className="h-4 w-16" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <SkeletonBase animated={animated} className="w-16 h-16 rounded-full" />
          <SkeletonBase animated={animated} className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBase animated={animated} className="h-2 w-full mt-4" />
    </div>
  );
}

// ─────────────────────────────────────────────
// SkeletonNewsCard — სიახლის ბარათის ჩონჩხი
// ─────────────────────────────────────────────
export function SkeletonNewsCard({ animated = true }: { animated?: boolean }) {
  return (
    <div className="bg-surface/60 border border-edge rounded-2xl overflow-hidden">
      <SkeletonBase animated={animated} className="aspect-[16/10] rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBase animated={animated} className="h-3 w-24" />
        <SkeletonBase animated={animated} className="h-4 w-full" />
        <SkeletonBase animated={animated} className="h-4 w-3/4" />
        <div className="flex items-center gap-3 pt-2">
          <SkeletonBase animated={animated} className="h-2 w-16" />
          <SkeletonBase animated={animated} className="h-2 w-12" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
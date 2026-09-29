// ═══════════════════════════════════════════════════════════════
//  Container — კონტეინერი კონსისტენტური სივრცისთვის
//  ყველა გვერდზე იგივე max-width და padding
// ═══════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside';
}

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
};

export function Container({
  size = 'lg',
  padding = true,
  as: Component = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        sizes[size],
        padding && 'px-4 lg:px-6',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Container;

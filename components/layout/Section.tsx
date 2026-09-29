// ═══════════════════════════════════════════════════════════════
//  Section — სექციის wrapper (ვერტიკალური სივრცე)
//  გამოიყენება: გვერდების სექციებისთვის
// ═══════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils';
import { Container } from './Container';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** სივრცე ზემოთ/ქვემოთ */
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Container-ის გამოყენება */
  container?: boolean;
  /** Container-ის ზომა */
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** სათაური */
  title?: string;
  /** ქვესათაური */
  subtitle?: string;
  /** მოქმედების ღილაკი */
  action?: React.ReactNode;
  /** ფონის ვარიანტი */
  variant?: 'default' | 'muted' | 'gradient';
  /** HTML ელემენტი */
  as?: 'section' | 'div' | 'article' | 'aside';
}

const spacings = {
  none: '',
  sm: 'py-4 lg:py-6',
  md: 'py-8 lg:py-10',
  lg: 'py-12 lg:py-16',
  xl: 'py-16 lg:py-24',
};

const variants = {
  default: '',
  muted: 'bg-surface/30',
  gradient: 'bg-gradient-to-b from-surface/20 to-transparent',
};

export function Section({
  spacing = 'md',
  container = true,
  containerSize = 'lg',
  title,
  subtitle,
  action,
  variant = 'default',
  as: Component = 'section',
  className,
  children,
  ...props
}: SectionProps) {
  const content = (
    <>
      {/* Header */}
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
          <div className="min-w-0">
            {title && (
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-text tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm lg:text-base text-muted mt-1.5">{subtitle}</p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {children}
    </>
  );

  return (
    <Component
      className={cn(spacings[spacing], variants[variant], className)}
      {...props}
    >
      {container ? (
        <Container size={containerSize}>{content}</Container>
      ) : (
        content
      )}
    </Component>
  );
}

export default Section;

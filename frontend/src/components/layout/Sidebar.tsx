import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { NavLink } from '@/components/navigation/NavLink';
import { navigationItems } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sidebar component props interface
 */
interface SidebarProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Collapsible sidebar component with navigation menu
 * Responsive design with desktop-only visibility
 * Integrated with React Router and authentication
 *
 * Features:
 * - Collapsible to icon-only view
 * - Smooth transitions and animations
 * - Active link highlighting
 * - Accessible keyboard navigation
 * - Shows only accessible routes based on auth status
 *
 * @param className - Additional CSS classes to apply
 *
 * @example
 * <Sidebar />
 */
export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated, user } = useAuth();

  /**
   * Toggle sidebar collapsed state
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Filter navigation items based on authentication
  const visibleNavItems = navigationItems.filter(
    (item) => !item.protected || isAuthenticated
  );

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Sidebar header with collapse button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn('ml-auto', isCollapsed && 'mx-auto')}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isCollapsed={isCollapsed}
            variant="sidebar"
            description={item.description}
          />
        ))}
      </nav>

      <Separator />

      {/* Sidebar footer - User info */}
      {isAuthenticated && user && (
        <div className="p-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-md bg-secondary p-3',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

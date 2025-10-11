import {
  Home,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * Navigation menu item interface
 */
interface NavItem {
  /** Display label for the nav item */
  label: string;
  /** URL or hash link */
  href: string;
  /** Icon component from lucide-react */
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Sidebar navigation items configuration
 */
const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '#home',
    icon: Home,
  },
  {
    label: 'Dashboard',
    href: '#dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: '#projects',
    icon: FolderKanban,
  },
  {
    label: 'Team',
    href: '#team',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '#settings',
    icon: Settings,
  },
];

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
 *
 * Features:
 * - Collapsible to icon-only view
 * - Smooth transitions and animations
 * - Active link highlighting
 * - Accessible keyboard navigation
 *
 * @param className - Additional CSS classes to apply
 *
 * @example
 * <Sidebar />
 */
export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('#home');

  /**
   * Toggle sidebar collapsed state
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-bold">Menu</span>
          </div>
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActiveItem(item.href)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      <Separator />

      {/* Sidebar footer */}
      <div className="p-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md bg-secondary p-3',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary" />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">John Doe</span>
              <span className="truncate text-xs text-muted-foreground">
                john@example.com
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

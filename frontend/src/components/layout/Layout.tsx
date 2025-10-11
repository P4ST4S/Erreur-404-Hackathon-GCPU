import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mobile navigation menu items (same as sidebar)
 */
const mobileNavItems = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Dashboard', href: '#dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '#projects', icon: FolderKanban },
  { label: 'Team', href: '#team', icon: Users },
  { label: 'Settings', href: '#settings', icon: Settings },
];

/**
 * Layout component props interface
 */
interface LayoutProps {
  /** Page content to display */
  children: React.ReactNode;
  /** Additional CSS classes for the main content area */
  className?: string;
}

/**
 * Main application layout component
 * Combines Header, Sidebar, Footer, and mobile navigation
 *
 * Features:
 * - Responsive design with mobile sheet menu
 * - Sticky header
 * - Collapsible sidebar (desktop)
 * - Flexible content area
 * - Footer at bottom
 *
 * @param children - Main page content
 * @param className - Additional CSS classes for content area
 *
 * @example
 * <Layout>
 *   <div>Your page content</div>
 * </Layout>
 */
export function Layout({ children, className }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Close mobile menu and navigate to href
   */
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    // Navigation will happen via anchor link
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Mobile navigation sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary" />
              <SheetTitle>Menu</SheetTitle>
            </div>
          </SheetHeader>

          {/* Mobile navigation items */}
          <nav className="flex flex-col gap-1 p-4">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNavClick}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Header - sticky at top */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Main content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'container mx-auto px-4 py-8',
            className
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/navigation/NavLink";
import { navigationItems } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAuthenticated } = useAuth();

  /**
   * Close mobile menu after navigation
   */
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };
  const mobileNavItems = navigationItems.filter(
    (item) => !item.protected || isAuthenticated
  );

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Mobile navigation sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
                <ShieldCheck className="text-primary-foreground h-5 w-5" />
              </div>
              <SheetTitle>MedicAnonym</SheetTitle>
            </div>
          </SheetHeader>

          {/* Mobile navigation items */}
          <nav className="flex flex-col gap-1 p-4">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                variant="mobile"
                onClick={handleMobileNavClick}
                description={item.description}
              />
            ))}
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
            "flex-1 overflow-y-auto",
            "container mx-auto px-4 py-8",
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

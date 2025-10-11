import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Header component props interface
 */
interface HeaderProps {
  /** Callback function to toggle sidebar visibility */
  onMenuClick?: () => void;
}

/**
 * Header component with navigation and theme toggle
 * Responsive design with mobile menu button
 *
 * @param onMenuClick - Function called when menu button is clicked (mobile)
 *
 * @example
 * <Header onMenuClick={() => setSidebarOpen(true)} />
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section: Mobile menu button + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button - visible on small screens */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="hidden font-bold sm:inline-block">
              Your App
            </span>
          </div>
        </div>

        {/* Center section: Navigation links (desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </a>
          <a
            href="#projects"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </a>
          <a
            href="#team"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Team
          </a>
          <a
            href="#settings"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Settings
          </a>
        </nav>

        {/* Right section: Theme toggle + User actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User profile button (placeholder) */}
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm">
            Account
          </Button>
        </div>
      </div>
    </header>
  );
}

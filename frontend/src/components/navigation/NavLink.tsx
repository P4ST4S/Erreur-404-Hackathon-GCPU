import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NavLink component props
 */
interface NavLinkProps {
  /** Link destination path */
  href: string;
  /** Link text label */
  label: string;
  /** Icon component */
  icon: LucideIcon;
  /** Whether the sidebar is collapsed (icon-only mode) */
  isCollapsed?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Display variant */
  variant?: "sidebar" | "header" | "mobile";
  /** Optional description for tooltip */
  description?: string;
}

/**
 * Reusable navigation link component with active state highlighting
 * Built on shadcn/ui primitives with React Router integration
 *
 * @example
 * <NavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
 */
export function NavLink({
  href,
  label,
  icon: Icon,
  isCollapsed = false,
  onClick,
  variant = "sidebar",
  description,
}: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  // Sidebar variant - for desktop sidebar navigation
  if (variant === "sidebar") {
    return (
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? label : description}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  }

  // Header variant - for top navigation bar
  if (variant === "header") {
    return (
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          "text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        title={description}
      >
        {label}
      </Link>
    );
  }

  // Mobile variant - for mobile sheet menu
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      title={description}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

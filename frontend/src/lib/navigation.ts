import {
    Home,
    LayoutDashboard,
    FileText,
    Upload,
    ShieldCheck,
    Settings,
    type LucideIcon,
} from "lucide-react";

/**
 * Navigation item interface
 */
export interface NavItem {
    /** Display label for the nav item */
    label: string;
    /** Route path */
    href: string;
    /** Icon component from lucide-react */
    icon: LucideIcon;
    /** Whether this route requires authentication */
    protected?: boolean;
    /** Optional description for tooltips */
    description?: string;
}

/**
 * Navigation items configuration for medical data anonymization app
 * Tailored for healthcare professionals working with sensitive patient data
 */
export const navigationItems: NavItem[] = [
    {
        label: "Home",
        href: "/",
        icon: Home,
        description: "Return to home page",
    },
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        protected: true,
        description: "View anonymization statistics and recent activity",
    },
    {
        label: "Anonymize",
        href: "/anonymize",
        icon: Upload,
        protected: true,
        description: "Upload and anonymize medical documents",
    },
    {
        label: "Documents",
        href: "/documents",
        icon: FileText,
        protected: true,
        description: "Manage anonymized documents",
    },
    {
        label: "Compliance",
        href: "/compliance",
        icon: ShieldCheck,
        protected: true,
        description: "HIPAA and GDPR compliance reports",
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        protected: true,
        description: "Configure anonymization rules and preferences",
    },
];

/**
 * Get navigation items based on authentication status
 */
export function getNavItems(isAuthenticated: boolean): NavItem[] {
    if (isAuthenticated) {
        return navigationItems;
    }
    return navigationItems.filter((item) => !item.protected);
}

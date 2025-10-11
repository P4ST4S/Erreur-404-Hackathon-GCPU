import { Github, Twitter, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

/**
 * Footer component with links and social media icons
 * Responsive design with centered layout on mobile
 *
 * @example
 * <Footer />
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background w-full border-t">
            <div className="container px-4 py-8">
                {/* Main footer content */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary h-8 w-8 rounded-md" />
                            <span className="font-bold">MedicAnonym</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Building amazing experiences with modern web
                            technologies.
                        </p>
                    </div>

                    {/* Product links */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold">Product</h3>
                        <nav className="flex flex-col gap-2">
                            <a
                                href="#features"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="#changelog"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Changelog
                            </a>
                            <a
                                href="#roadmap"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Roadmap
                            </a>
                        </nav>
                    </div>

                    {/* Company links */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold">Company</h3>
                        <nav className="flex flex-col gap-2">
                            <a
                                href="#about"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                About
                            </a>
                            <a
                                href="#blog"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Blog
                            </a>
                            <a
                                href="#careers"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Careers
                            </a>
                            <a
                                href="#contact"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Contact
                            </a>
                        </nav>
                    </div>

                    {/* Resources links */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold">Resources</h3>
                        <nav className="flex flex-col gap-2">
                            <a
                                href="#docs"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Documentation
                            </a>
                            <a
                                href="#help"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Help Center
                            </a>
                            <a
                                href="#community"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Community
                            </a>
                            <a
                                href="#status"
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                                Status
                            </a>
                        </nav>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Bottom section with copyright and social links */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-muted-foreground text-sm">
                        © {currentYear} MedicAnonym. All rights reserved.
                    </p>

                    {/* Social media links */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label="GitHub"
                        >
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label="Twitter"
                        >
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label="LinkedIn"
                        >
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import { Github, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
    <footer className="w-full border-t bg-background">
      <div className="container px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary" />
              <span className="font-bold">Your App</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building amazing experiences with modern web technologies.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Product</h3>
            <nav className="flex flex-col gap-2">
              <a
                href="#features"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </a>
              <a
                href="#changelog"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Changelog
              </a>
              <a
                href="#roadmap"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </a>
              <a
                href="#blog"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Blog
              </a>
              <a
                href="#careers"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Careers
              </a>
              <a
                href="#contact"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </a>
              <a
                href="#help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Help Center
              </a>
              <a
                href="#community"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Community
              </a>
              <a
                href="#status"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Status
              </a>
            </nav>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom section with copyright and social links */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Your App. All rights reserved.
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

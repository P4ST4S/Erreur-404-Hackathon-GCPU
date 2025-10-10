import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Main application component
 * Demonstrates the Layout component with example content
 *
 * This is a showcase of the shadcn/ui integration with:
 * - Responsive layout with Header, Sidebar, and Footer
 * - Theme switching (light/dark mode)
 * - shadcn/ui components (Button, Separator)
 * - Tailwind CSS utilities
 */
function App() {
  return (
    <Layout>
      {/* Hero section */}
      <section className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to Your App
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A modern React application built with TypeScript, TailwindCSS, and
          shadcn/ui component library. Experience clean design, dark mode
          support, and responsive layouts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Features section */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature card 1 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">TypeScript First</h3>
            <p className="text-muted-foreground">
              Built with TypeScript for type safety and better developer
              experience with full IntelliSense support.
            </p>
          </div>

          {/* Feature card 2 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" x2="12" y1="8" y2="8" />
                <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
                <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Component Library
            </h3>
            <p className="text-muted-foreground">
              Powered by shadcn/ui with accessible, customizable components
              built on Radix UI primitives.
            </p>
          </div>

          {/* Feature card 3 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Dark Mode</h3>
            <p className="text-muted-foreground">
              Built-in theme switching with system preference detection for a
              comfortable viewing experience.
            </p>
          </div>

          {/* Feature card 4 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Responsive Design</h3>
            <p className="text-muted-foreground">
              Mobile-first responsive layouts that adapt seamlessly to any
              screen size and device.
            </p>
          </div>

          {/* Feature card 5 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              TailwindCSS Utilities
            </h3>
            <p className="text-muted-foreground">
              Rapid UI development with utility-first CSS framework and custom
              design tokens.
            </p>
          </div>

          {/* Feature card 6 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Accessibility</h3>
            <p className="text-muted-foreground">
              WCAG compliant components with keyboard navigation and screen
              reader support built-in.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* CTA section */}
      <section className="py-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Start building your next project with our modern stack.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" variant="default">
            Start Building
          </Button>
          <Button size="lg" variant="secondary">
            View Documentation
          </Button>
        </div>
      </section>
    </Layout>
  );
}

export default App;

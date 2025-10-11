import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Lock, Zap, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Home page - Landing page for the medical data anonymization application
 */
export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero section */}
      <section className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Medical Data Anonymization
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Protect patient privacy with AI-powered anonymization. Automatically
          identify and redact sensitive information from medical documents while
          maintaining HIPAA and GDPR compliance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/anonymize">Start Anonymizing</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn More</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Features section */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Why Choose Our Platform?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1: AI-Powered */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered Detection</h3>
            <p className="text-muted-foreground">
              Advanced agentic AI automatically identifies and redacts PHI, PII,
              and other sensitive information with high accuracy.
            </p>
          </div>

          {/* Feature 2: HIPAA Compliant */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">HIPAA & GDPR Compliant</h3>
            <p className="text-muted-foreground">
              Built with healthcare compliance in mind. Detailed audit trails
              and compliance reports for regulatory requirements.
            </p>
          </div>

          {/* Feature 3: Secure */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Enterprise Security</h3>
            <p className="text-muted-foreground">
              End-to-end encryption, secure data handling, and role-based access
              control to protect sensitive medical information.
            </p>
          </div>

          {/* Feature 4: Accurate */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Quality Assurance</h3>
            <p className="text-muted-foreground">
              Review and verify anonymized documents. Manual override options
              for critical use cases and quality control.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* CTA section */}
      <section className="py-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          Ready to Protect Patient Privacy?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Start anonymizing medical documents today with our AI-powered
          platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!isAuthenticated && (
            <Button asChild size="lg" variant="default">
              <Link to="/login">Start Free Trial</Link>
            </Button>
          )}
        </div>
      </section>
    </>
  );
}

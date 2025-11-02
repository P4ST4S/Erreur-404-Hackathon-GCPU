import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Login page
 * Provides authentication form for users to access protected routes
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <ShieldCheck className="text-primary h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your medical data anonymization account
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email field */}
            <FormField
              id="email"
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              required
            />

            {/* Password field */}
            <FormField
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Additional links */}
          <div className="text-center text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </form>

        {/* Demo credentials notice */}
        <div className="bg-muted/50 rounded-lg border p-4 text-sm">
          <p className="mb-2 font-semibold">Demo Mode</p>
          <p className="text-muted-foreground">
            Enter any email and password to sign in. In production, this will
            connect to your authentication system.
          </p>
        </div>

        {/* Back to home */}
        <div className="text-muted-foreground text-center text-sm">
          <Link to="/" className="hover:text-primary hover:underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

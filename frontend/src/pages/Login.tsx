import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

    // Get the page user was trying to access
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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to your medical data anonymization account
                    </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Email field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="doctor@hospital.com"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
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
                        Enter any email and password to sign in. In production,
                        this will connect to your authentication system.
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

import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { router } from "@/router";

/**
 * Main application component
 * Provides authentication context and routing for the medical data anonymization app
 *
 * Features:
 * - React Router for client-side routing
 * - Authentication context for protected routes
 * - Theme switching (light/dark mode) via Layout
 * - Responsive navigation with Header and Sidebar
 */
function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;

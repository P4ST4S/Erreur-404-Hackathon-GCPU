import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

/**
 * Theme provider component wrapper
 * Enables light/dark mode switching across the application
 *
 * @param props - ThemeProvider configuration props
 * @param props.children - React children to wrap with theme context
 * @param props.attribute - HTML attribute to use for theme (default: 'class')
 * @param props.defaultTheme - Default theme to use (default: 'system')
 * @param props.enableSystem - Enable system theme detection (default: true)
 *
 * @example
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

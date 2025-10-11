import { forwardRef, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FormField component props
 */
export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label: string;
  /** Field ID (also used as name if name not provided) */
  id: string;
  /** Optional error message */
  error?: string;
  /** Optional icon to display on the left */
  icon?: LucideIcon;
  /** Optional helper text */
  helperText?: string;
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
}

/**
 * Reusable form field component with label, input, icon, and error handling
 * Built on shadcn/ui primitives
 *
 * @example
 * <FormField
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   icon={Mail}
 *   placeholder="you@example.com"
 *   required
 * />
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      id,
      error,
      icon: Icon,
      helperText,
      containerClassName,
      labelClassName,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        <label
          htmlFor={id}
          className={cn(
            "block text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2",
            error && "text-destructive",
            labelClassName
          )}
        >
          {label}
        </label>

        {/* Input container with optional icon */}
        <div className="relative">
          {Icon && (
            <Icon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          )}
          <input
            ref={ref}
            id={id}
            name={props.name || id}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            {...props}
          />
        </div>

        {/* Helper text or error message */}
        {error && (
          <p
            id={`${id}-error`}
            className="text-destructive text-sm font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="text-muted-foreground text-sm">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

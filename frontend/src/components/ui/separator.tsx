import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

/**
 * Separator component for visual division of content
 * Built on Radix UI Separator primitive
 *
 * @param orientation - Separator direction: 'horizontal' or 'vertical' (default: 'horizontal')
 * @param decorative - If true, separator is decorative and ignored by screen readers
 * @param className - Additional CSS classes
 *
 * @example
 * <Separator /> // Horizontal separator
 * <Separator orientation="vertical" className="h-20" /> // Vertical separator
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:border-primary",
          className
        )}
        ref={ref}
        {...props}
      />
      <Check
        className="absolute h-4 w-4 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
      />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };

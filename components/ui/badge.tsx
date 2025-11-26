import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "outline" | "success"

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-foreground",
  outline: "border border-input text-foreground",
  success: "bg-[#00B900] text-white",
}

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }

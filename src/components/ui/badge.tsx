import * as React from "react"
import { cx } from "@/lib/utils"

const baseClasses = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] aria-invalid:ring-err/20 dark:aria-invalid:ring-err/40 aria-invalid:border-err transition-[color,box-shadow] overflow-hidden"

const variantMap: Record<string, string> = {
  default: "border-transparent bg-brand text-brand-fg [a&]:hover:bg-brand/90",
  secondary: "border-transparent bg-alt text-alt-fg [a&]:hover:bg-alt/90",
  destructive: "border-transparent bg-err text-white [a&]:hover:bg-err/90 focus-visible:ring-err/20 dark:focus-visible:ring-err/40 dark:bg-err/60",
  outline: "text-ink [a&]:hover:bg-tint [a&]:hover:text-tint-fg",
}

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: keyof typeof variantMap
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span className={cx(baseClasses, variantMap[variant], className)} {...props}>
      {children}
    </span>
  )
}

export { Badge }

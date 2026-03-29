import * as React from "react"
import { cx } from "@/lib/utils"

const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] aria-invalid:ring-err/20 dark:aria-invalid:ring-err/40 aria-invalid:border-err"

const sizeMap: Record<string, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
}

const variantMap: Record<string, string> = {
  default: "bg-brand text-brand-fg shadow-xs hover:bg-brand/90",
  destructive: "bg-err text-white shadow-xs hover:bg-err/90 focus-visible:ring-err/20 dark:focus-visible:ring-err/40 dark:bg-err/60",
  outline: "border bg-page shadow-xs hover:bg-tint hover:text-tint-fg dark:bg-field/30 dark:border-field dark:hover:bg-field/50",
  secondary: "bg-alt text-alt-fg shadow-xs hover:bg-alt/80",
  ghost: "hover:bg-tint hover:text-tint-fg dark:hover:bg-tint/50",
  link: "text-brand underline-offset-4 hover:underline",
}

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: keyof typeof variantMap
  size?: keyof typeof sizeMap
}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cx(baseClasses, variantMap[variant], sizeMap[size], className)}
      {...props}
    />
  )
}

export { Button }

import * as React from "react"
import { cx } from "@/lib/utils"

const baseClasses = "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current"

const variantMap: Record<string, string> = {
  default: "bg-surface text-surface-fg",
  destructive: "text-err bg-surface [&>svg]:text-current *:data-[slot=alert-description]:text-err/90",
}

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: keyof typeof variantMap
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div role="alert" className={cx(baseClasses, variantMap[variant], className)} {...props} />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cx("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)} {...props} />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cx("text-soft-fg col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
}

export { Alert, AlertTitle, AlertDescription }

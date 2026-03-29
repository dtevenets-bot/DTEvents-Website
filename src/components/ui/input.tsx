import * as React from "react"

import { cx } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cx(
        "file:text-ink placeholder:text-soft-fg selection:bg-brand selection:text-brand-fg dark:bg-field/30 border-field flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-err/20 dark:aria-invalid:ring-err/40 aria-invalid:border-err",
        className
      )}
      {...props}
    />
  )
}

export { Input }

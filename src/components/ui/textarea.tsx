import * as React from "react"

import { cx } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(
        "border-field placeholder:text-soft-fg focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 aria-invalid:ring-err/20 dark:aria-invalid:ring-err/40 aria-invalid:border-err dark:bg-field/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

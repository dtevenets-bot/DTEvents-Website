"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Sheet Context                                                       */
/* ------------------------------------------------------------------ */

interface SheetContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  setOpen: () => {},
})

function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === "function" ? value(open) : value
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, open, onOpenChange]
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  SheetTrigger                                                        */
/* ------------------------------------------------------------------ */

function SheetTrigger({
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = React.useContext(SheetContext)
  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  SheetClose                                                          */
/* ------------------------------------------------------------------ */

function SheetClose({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = React.useContext(SheetContext)
  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  SheetContent                                                        */
/* ------------------------------------------------------------------ */

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  const { open, setOpen } = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Escape to close
  React.useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, setOpen])

  if (!mounted) return null

  const sideClasses: Record<string, string> = {
    right:
      "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm translate-x-full",
    left:
      "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm -translate-x-full",
    top: "inset-x-0 top-0 h-auto border-b -translate-y-full",
    bottom: "inset-x-0 bottom-0 h-auto border-t translate-y-full",
  }

  const openTranslate: Record<string, string> = {
    right: "translate-x-0",
    left: "translate-x-0",
    top: "translate-y-0",
    bottom: "translate-y-0",
  }

  const content = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 p-4 shadow-lg transition-transform duration-300 ease-in-out",
          sideClasses[side],
          className
        )}
        style={{
          transform: open ? openTranslate[side] : undefined,
        }}
        {...props}
      >
        {children}
        <button
          type="button"
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

/* ------------------------------------------------------------------ */
/*  SheetHeader                                                         */
/* ------------------------------------------------------------------ */

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  SheetFooter                                                         */
/* ------------------------------------------------------------------ */

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  SheetTitle                                                          */
/* ------------------------------------------------------------------ */

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  SheetDescription                                                    */
/* ------------------------------------------------------------------ */

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

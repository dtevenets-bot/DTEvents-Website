"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cx } from "@/lib/utils"

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
    <div className={cx("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cx(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal
        className={cx(
          "bg-page fixed z-50 flex flex-col gap-4 p-4 shadow-lg transition-transform duration-300 ease-in-out",
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
          className="ring-offset-page focus:ring-focus-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
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

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cx("text-ink font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cx("text-soft-fg text-sm", className)}
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

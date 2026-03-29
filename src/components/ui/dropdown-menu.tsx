"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  DropdownMenu Context                                                */
/* ------------------------------------------------------------------ */

interface DropdownMenuContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
})

/* ------------------------------------------------------------------ */
/*  DropdownMenu                                                        */
/* ------------------------------------------------------------------ */

function DropdownMenu({
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
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === "function" ? value(open) : value
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, open, onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuTrigger                                                 */
/* ------------------------------------------------------------------ */

function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuContent                                                 */
/* ------------------------------------------------------------------ */

function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = "start",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  sideOffset?: number
  align?: "start" | "center" | "end"
}) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Compute position
  React.useEffect(() => {
    if (!open || !triggerRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    let top = trigger.bottom + sideOffset
    let left = trigger.left

    if (align === "center") {
      left = trigger.left + trigger.width / 2
    } else if (align === "end") {
      left = trigger.right
    }

    setPosition({ top, left })
  }, [open, sideOffset, align, triggerRef])

  // Click outside to close
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen, triggerRef])

  if (!mounted || !open) return null

  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0"

  const content = (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuItem                                                    */
/* ------------------------------------------------------------------ */

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onClick,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <div
      role="menuitem"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "destructive" && "text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive",
        inset && "pl-8",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuLabel                                                   */
/* ------------------------------------------------------------------ */

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
}) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuSeparator                                               */
/* ------------------------------------------------------------------ */

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuGroup                                                   */
/* ------------------------------------------------------------------ */

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuShortcut                                                */
/* ------------------------------------------------------------------ */

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
}

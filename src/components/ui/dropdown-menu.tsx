"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cx } from "@/lib/utils"

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
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 })
  const [mounted, setMounted] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open || !triggerRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const top = trigger.bottom + sideOffset
    const vw = window.innerWidth

    if (align === "end") {
      // Anchor the right edge of the menu to the right edge of the trigger
      setPosition({
        top,
        left: 0,
        right: vw - trigger.right,
      })
    } else if (align === "center") {
      setPosition({
        top,
        left: trigger.left + trigger.width / 2,
        right: 0,
      })
    } else {
      setPosition({
        top,
        left: trigger.left,
        right: 0,
      })
    }
  }, [open, sideOffset, align, triggerRef])

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

  const style: React.CSSProperties = {
    position: "fixed",
    top: position.top,
  }

  if (align === "end") {
    style.right = position.right
  } else if (align === "center") {
    style.left = position.left
    style.transform = "translateX(-50%)"
  } else {
    style.left = position.left
  }

  const content = (
    <div
      ref={contentRef}
      role="menu"
      className={cx(
        "bg-popup text-popup-fg z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

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
      className={cx(
        "focus:bg-tint focus:text-tint-fg relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "destructive" && "text-err focus:bg-err/10 dark:focus:bg-err/20 focus:text-err",
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

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
}) {
  return (
    <div
      className={cx("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cx("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cx(
        "text-soft-fg ml-auto text-xs tracking-widest",
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

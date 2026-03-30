"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cx } from "@/lib/utils"

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  contentId: string
  multiple?: boolean
  selectedValues?: string[]
}

const SelectContext = React.createContext<SelectContextValue>({
  value: undefined,
  onValueChange: undefined,
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentId: "",
  multiple: false,
  selectedValues: [],
})

let selectIdCounter = 0
function generateSelectId() {
  return `select-content-${++selectIdCounter}`
}

function Select({
  value,
  onValueChange,
  defaultValue,
  multiple = false,
  selectedValues,
  children,
}: {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  multiple?: boolean
  selectedValues?: string[]
  children: React.ReactNode
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentId = React.useMemo(() => generateSelectId(), [])

  const currentValue = value ?? internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) setInternalValue(newValue)
      onValueChange?.(newValue)
      if (!multiple) setOpen(false)
    },
    [value, onValueChange, multiple]
  )

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        triggerRef,
        contentId,
        multiple,
        selectedValues: selectedValues ?? [],
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"button"> & {
  size?: "sm" | "default"
}) {
  const { open, setOpen, triggerRef, contentId } = React.useContext(SelectContext)

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-controls={contentId}
      aria-multiselectable={undefined}
      onClick={() => setOpen(!open)}
      className={cx(
        "border-field data-[placeholder]:text-soft-fg [&_svg:not([class*='text-'])]:text-soft-fg focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 aria-invalid:ring-err/20 dark:aria-invalid:ring-err/40 aria-invalid:border-err dark:bg-field/30 dark:hover:bg-field/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
        size === "sm" && "h-8",
        className
      )}
      {...props}
    >
      {children}
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
        className="size-4 opacity-50 shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const ctx = React.useContext(SelectContext)

  if (ctx.multiple && ctx.selectedValues.length > 0) {
    const label =
      ctx.selectedValues.length === 1
        ? ctx.selectedValues[0]
        : `${ctx.selectedValues.length} selected`
    return (
      <span className={cx("flex items-center gap-2 line-clamp-1", className)}>
        {label}
      </span>
    )
  }

  return (
    <span className={cx("flex items-center gap-2 line-clamp-1", className)}>
      {ctx.value ? ctx.value : placeholder}
    </span>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<"div"> & {
  position?: "popper" | "item-aligned"
}) {
  const { open, setOpen, triggerRef, contentId } = React.useContext(SelectContext)
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [open, triggerRef])

  React.useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return
      setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen, triggerRef])

  if (!mounted || !open) return null

  const content = (
    <div
      ref={contentRef}
      id={contentId}
      role="listbox"
      aria-multiselectable={undefined}
      className={cx(
        "bg-popup text-popup-fg relative z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md animate-in fade-in-0 zoom-in-95 p-1",
        className
      )}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
      }}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} role="group" {...props} />
}

function SelectItem({
  className,
  value: itemValue,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx.multiple
    ? ctx.selectedValues.includes(itemValue)
    : ctx.value === itemValue

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={cx(
        "focus:bg-tint focus:text-tint-fg relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isSelected && "bg-tint text-tint-fg",
        className
      )}
      onClick={() => ctx.onValueChange?.(itemValue)}
      {...props}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
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
            className="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cx("text-soft-fg px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cx("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

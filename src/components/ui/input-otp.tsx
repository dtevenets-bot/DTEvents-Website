"use client"

import * as React from "react"

import { cx } from "@/lib/utils"

function InputOTP({
  maxLength = 6,
  value: controlledValue,
  defaultValue = "",
  onChange,
  disabled = false,
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"div"> & {
  maxLength?: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  containerClassName?: string
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const setValue = React.useCallback(
    (newValue: string) => {
      const clamped = newValue.slice(0, maxLength)
      if (!isControlled) setInternalValue(clamped)
      onChange?.(clamped)
    },
    [isControlled, maxLength, onChange]
  )

  const handleInput = (index: number, char: string) => {
    if (char.length > 1) {
      char = char[0]
    }
    const newValue = value.split("")
    newValue[index] = char
    const result = newValue.join("")
    setValue(result)

    if (char && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (value[index]) {
        const newValue = value.split("")
        newValue[index] = ""
        setValue(newValue.join(""))
      } else if (index > 0) {
        const newValue = value.split("")
        newValue[index - 1] = ""
        setValue(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select()
  }

  return (
    <div
      className={cx("flex items-center gap-2 has-disabled:opacity-50 disabled:cursor-not-allowed", containerClassName)}
      {...props}
    >
      {Array.from({ length: maxLength }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="text"
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cx(
            "border-field dark:bg-field/30 border-field relative flex h-9 w-9 items-center justify-center border-y border-r text-center text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onChange={(e) => handleInput(index, e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").slice(0, maxLength)
            if (pasted) {
              setValue(pasted)
              const nextIndex = Math.min(pasted.length, maxLength - 1)
              inputRefs.current[nextIndex]?.focus()
            }
          }}
        />
      ))}
    </div>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  return (
    <div
      className={cx(
        "border-field dark:bg-field/30 relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="separator" className={className} {...props}>
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
        <path d="M5 12h14" />
      </svg>
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

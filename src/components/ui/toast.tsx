"use client"

import * as React from "react"
import { cx } from "@/lib/utils"

const baseClasses = "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all"

const variantMap: Record<string, string> = {
  default: "border bg-page text-ink",
  destructive: "destructive group border-err bg-err text-err-fg",
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ToastViewport({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cx("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />
  )
}

function Toast({ className, variant = "default", ...props }: React.ComponentProps<"div">) {
  return <div className={cx(baseClasses, variantMap[variant], className)} {...props} />
}

function ToastTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("text-sm font-semibold [&+div]:text-xs", className)} {...props} />
}

function ToastDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("text-sm opacity-90", className)} {...props} />
}

function ToastAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button className={cx("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-alt focus:outline-none focus:ring-1 focus:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-soft/40 group-[.destructive]:hover:border-err/30 group-[.destructive]:hover:bg-err group-[.destructive]:hover:text-err-fg group-[.destructive]:focus:ring-err", className)} {...props} />
  )
}

function ToastClose({ className, onClick, ...props }: React.ComponentProps<"button">) {
  return (
    <button className={cx("absolute right-1 top-1 rounded-md p-1 text-ink/50 opacity-0 transition-opacity hover:text-ink focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className)} onClick={onClick} aria-label="Close" {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  )
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction }

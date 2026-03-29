"use client"

import * as React from "react"

import { cx } from "@/lib/utils"

const AvatarContext = React.createContext<{
  imageStatus: "loading" | "loaded" | "error"
  setImageStatus: (status: "loading" | "loaded" | "error") => void
}>({
  imageStatus: "loading",
  setImageStatus: () => {},
})

function Avatar({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")

  return (
    <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
      <span
        className={cx(
          "relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

function AvatarImage({
  className,
  src,
  alt = "",
  ...props
}: React.ComponentProps<"img">) {
  const { imageStatus, setImageStatus } = React.useContext(AvatarContext)

  if (imageStatus === "error") return null

  return (
    <img
      src={src}
      alt={alt}
      className={cx("aspect-square size-full", className)}
      onError={() => setImageStatus("error")}
      onLoad={() => setImageStatus("loaded")}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { imageStatus } = React.useContext(AvatarContext)

  if (imageStatus === "loaded") return null

  return (
    <span
      className={cx(
        "bg-soft flex size-full items-center justify-center rounded-full absolute inset-0",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Avatar, AvatarImage, AvatarFallback }

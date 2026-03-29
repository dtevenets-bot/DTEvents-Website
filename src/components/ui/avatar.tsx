"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Avatar Context                                                      */
/* ------------------------------------------------------------------ */

const AvatarContext = React.createContext<{
  imageStatus: "loading" | "loaded" | "error"
  setImageStatus: (status: "loading" | "loaded" | "error") => void
}>({
  imageStatus: "loading",
  setImageStatus: () => {},
})

/* ------------------------------------------------------------------ */
/*  Avatar                                                              */
/* ------------------------------------------------------------------ */

function Avatar({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")

  return (
    <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
      <span
        className={cn(
          "relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  AvatarImage                                                         */
/* ------------------------------------------------------------------ */

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
      className={cn("aspect-square size-full", className)}
      onError={() => setImageStatus("error")}
      onLoad={() => setImageStatus("loaded")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  AvatarFallback                                                      */
/* ------------------------------------------------------------------ */

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { imageStatus } = React.useContext(AvatarContext)

  // Only render fallback when image is not loaded
  if (imageStatus === "loaded") return null

  return (
    <span
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full absolute inset-0",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Avatar, AvatarImage, AvatarFallback }

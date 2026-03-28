"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink, AlertCircle } from "lucide-react"

export function LoginModal() {
  const [open, setOpen] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener("open-login", handleOpen)
    return () => window.removeEventListener("open-login", handleOpen)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || code.trim().length !== 6) {
      setError("Please enter a valid 6-character code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        code: code.trim().toUpperCase(),
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid code. Please run `/verify` in the DT Events Discord server to get a new code.")
      } else if (result?.ok) {
        setOpen(false)
        setCode("")
        setError(null)
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setCode("")
        setError(null)
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Login to DT Events</DialogTitle>
          <DialogDescription>
            Enter your verification code to access the Product Hub.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="verify-code" className="text-sm font-medium">
              Verification Code
            </Label>
            <Input
              id="verify-code"
              placeholder="Enter 6-character code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError(null)
              }}
              maxLength={6}
              className="text-center text-xl tracking-[0.3em] font-mono uppercase h-14"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Run{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                /verify
              </code>{" "}
              in the DT Events Discord server to get your login code
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              asChild
            >
              <a
                href="https://discord.gg/YrsyVzxk8H"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Discord Server
              </a>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

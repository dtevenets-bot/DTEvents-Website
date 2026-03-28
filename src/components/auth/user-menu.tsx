"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
import { useAuthStore, hasRole } from "@/stores/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Package, ChevronDown } from "lucide-react"

const roleLabels: Record<string, string> = {
  user: "User",
  booster: "Booster",
  admin: "Admin",
  owner: "Owner",
}

export function UserMenu() {
  const { data: session } = useSession()
  const user = useAuthStore((s) => s.user)

  const discordUser = user?.discordUser
  const role = user?.role ?? "user"
  const initials = discordUser?.username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U"

  const avatarUrl = discordUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-foreground hover:text-background transition-colors duration-300 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={discordUser?.username ?? "User"} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
            {discordUser?.username ?? "User"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl ?? undefined} alt={discordUser?.username ?? "User"} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{discordUser?.username}</span>
            <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 mt-0.5">
              {roleLabels[role] ?? "User"}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.dispatchEvent(new CustomEvent("hub-navigate", { detail: "my-products" }))
          }}
          className="cursor-pointer"
        >
          <Package className="h-4 w-4 mr-2" />
          My Products
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

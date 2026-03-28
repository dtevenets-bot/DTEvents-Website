"use client"

import * as React from "react"
import { motion } from "framer-motion"

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-muted-foreground">
            © 2026 DT Events. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://discord.gg/YrsyVzxk8H"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Discord
            </a>
            <a
              href="https://www.roblox.com/games/92326562289312/DT-Events-Hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Product Hub
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

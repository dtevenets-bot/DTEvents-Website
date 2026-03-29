'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export function CommissionsSection() {
  return (
    <section id="commissions" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-3">Custom Commissions</h2>
        <p className="text-soft-fg mb-8 max-w-xl mx-auto">
          Need something unique? Our team specializes in custom Roblox development.
          From gamepasses and plugins to full game systems, we deliver high-quality
          work tailored to your specifications.
        </p>

        <a
          href="https://discord.gg/dtevents"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-10 px-6 hover:bg-ink hover:text-page"
        >
          <ChatBubbleLeftRightIcon className="size-4" />
          Join our Discord
        </a>
      </div>
    </section>
  );
}

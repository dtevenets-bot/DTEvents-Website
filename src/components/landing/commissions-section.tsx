'use client';

import { Button } from '@/components/ui/button';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export function CommissionsSection() {
  return (
    <section id="commissions" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-3">Custom Commissions</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Need something unique? Our team specializes in custom Roblox development.
          From gamepasses and plugins to full game systems, we deliver high-quality
          work tailored to your specifications.
        </p>

        <Button
          size="lg"
          className="hover:bg-foreground hover:text-background"
          asChild
        >
          <a
            href="https://discord.gg/dtevents"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ChatBubbleLeftRightIcon className="size-4 mr-2" />
            Join our Discord
          </a>
        </Button>
      </div>
    </section>
  );
}

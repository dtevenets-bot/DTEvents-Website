'use client';

import { Cog6ToothIcon, SwatchIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    icon: Cog6ToothIcon,
    title: 'Product Manufacturing',
    description:
      'Professional-grade Roblox gamepasses, plugins, and assets built with clean architecture and performance in mind.',
  },
  {
    icon: SwatchIcon,
    title: 'Custom Commissions',
    description:
      'Bespoke development tailored to your unique vision. From UI design to complex systems, we bring your ideas to life.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Event Hosting',
    description:
      'End-to-end event management for Roblox communities. Custom games, scoring systems, and live moderation tools.',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for premium Roblox development, all under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group border transition-colors hover:bg-foreground hover:text-background py-0"
            >
              <CardContent className="flex flex-col items-center text-center p-8 pt-8 gap-4">
                <div className="size-14 rounded-full border bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                  <service.icon className="size-6" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-sm opacity-70">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

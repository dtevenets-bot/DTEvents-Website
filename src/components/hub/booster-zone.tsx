'use client';

import { ProductGrid } from '@/components/hub/product-grid';
import { Badge } from '@/components/ui/badge';
import { BoltIcon } from '@heroicons/react/24/outline';

export function BoosterZone() {
  return (
    <div>
      <div className="mb-6 p-4 border border-dashed rounded-lg bg-ink text-page">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-page text-ink flex items-center justify-center">
            <BoltIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Booster Exclusive Zone</h2>
            <p className="text-sm opacity-80">
              These products are exclusively available to boosters.
            </p>
          </div>
        </div>
      </div>

      <ProductGrid boosterOnly />
    </div>
  );
}

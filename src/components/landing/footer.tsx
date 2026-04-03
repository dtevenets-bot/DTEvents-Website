export function Footer() {
  return (
    <footer className="mt-auto border-t border-edge bg-page text-ink">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <img src="/logo.png" alt="DT Events" className="size-8" />
            <div>
              <p className="font-bold text-lg">DT Events</p>
              <p className="text-sm text-ink/60">
                Premium Roblox Development Solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-ink/60">
            <a
              href="#services"
              className="hover:text-ink transition-colors"
            >
              Services
            </a>
            <a
              href="#products"
              className="hover:text-ink transition-colors"
            >
              Products
            </a>
            <a
              href="#commissions"
              className="hover:text-ink transition-colors"
            >
              Commissions
            </a>
            <a
              href="https://discord.gg/dtevents"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Discord
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-edge/10 text-center text-xs text-ink/40">
          &copy; {new Date().getFullYear()} DT Events. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

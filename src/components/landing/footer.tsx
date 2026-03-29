export function Footer() {
  return (
    <footer className="mt-auto border-t bg-foreground text-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="text-center md:text-left">
            <p className="font-bold text-lg">DT Events</p>
            <p className="text-sm text-background/60">
              Premium Roblox Development Solutions
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-background/60">
            <a
              href="#services"
              className="hover:text-background transition-colors"
            >
              Services
            </a>
            <a
              href="#products"
              className="hover:text-background transition-colors"
            >
              Products
            </a>
            <a
              href="#commissions"
              className="hover:text-background transition-colors"
            >
              Commissions
            </a>
            <a
              href="https://discord.gg/dtevents"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background transition-colors"
            >
              Discord
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-background/10 text-center text-xs text-background/40">
          &copy; {new Date().getFullYear()} DT Events. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

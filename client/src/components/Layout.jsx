import Navbar from "./Navbar";

export default function Layout({ children, hideNav = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-ink-800 text-left">
      {!hideNav && <Navbar />}
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-cream-300 bg-cream-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} WanderWise AI · Plan smarter trips with AI.</p>
          <p className="text-ink-400">Built by Srijith Mulupuri</p>
        </div>
      </footer>
    </div>
  );
}

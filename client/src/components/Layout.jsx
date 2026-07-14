import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ children, hideNav = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-ink-800 text-left">
      {!hideNav && <Navbar />}
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-cream-300 bg-cream-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()} <span className="font-display italic">Nostosa</span> · made for wanderers.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-forest-700 transition">Contact</Link>
            <span className="text-ink-400">Built by Srijith Mulupuri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

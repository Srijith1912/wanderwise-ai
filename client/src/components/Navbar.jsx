import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-soft group-hover:scale-105 group-hover:rotate-3 transition">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
        <path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z" />
      </svg>
    </span>
    <span className="font-display text-[1.35rem] text-ink-900 tracking-tight leading-none">
      <em className="italic font-medium">Wander</em><span className="font-semibold">Wise</span>
    </span>
  </Link>
);

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-lg text-sm font-medium transition ${
        isActive
          ? "text-forest-700 bg-forest-50"
          : "text-ink-700 hover:text-ink-900 hover:bg-cream-200"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Theme — the <html> class is set pre-paint by an inline script in index.html;
  // this state just mirrors it for the icon and persists changes.
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("wanderwise:theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/85 backdrop-blur border-b border-cream-300">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="h-16 flex items-center justify-between gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/">Explore</NavItem>
            <NavItem to="/planner">Plan a trip</NavItem>
            {user && <NavItem to="/feed">Feed</NavItem>}
            {user && <NavItem to="/trips">My trips</NavItem>}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full text-ink-600 hover:text-ink-900 hover:bg-cream-200 transition"
            >
              {dark ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-ink-700 hover:text-ink-900 px-3 py-2 rounded-lg hover:bg-cream-200 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold bg-forest-600 hover:bg-forest-700 text-white px-4 py-2 rounded-xl shadow-soft transition"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-cream-300 hover:shadow-soft hover:border-ink-300 transition bg-white"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  <Avatar name={user.name} src={user.profilePicture} size="xs" />
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-cream-300 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cream-200">
                      <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
                      <p className="text-xs text-ink-500 truncate">{user.email}</p>
                    </div>
                    <Link to={`/profile/${user.id}`} className="block px-4 py-2 text-sm text-ink-700 hover:bg-cream-100">My profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-ink-700 hover:bg-cream-100">Settings</Link>
                    <div className="border-t border-cream-200 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-coral-600 hover:bg-coral-50 font-medium"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-cream-200 transition"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-ink-700" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-cream-200 pt-2">
            <NavItem to="/">Explore</NavItem>
            <NavItem to="/planner">Plan a trip</NavItem>
            {user && <NavItem to="/feed">Feed</NavItem>}
            {user && <NavItem to="/trips">My trips</NavItem>}
            {user && <NavItem to={`/profile/${user.id}`}>My profile</NavItem>}
            {user && <NavItem to="/settings">Settings</NavItem>}
            {!user && <NavItem to="/login">Log in</NavItem>}
          </div>
        )}
      </div>
    </header>
  );
}

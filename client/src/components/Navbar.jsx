import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const linkCls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-thread-border text-white'
        : 'text-thread-muted hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-thread-border bg-thread-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-thread-accent text-sm font-bold text-white">
            C
          </span>
          <span className="hidden sm:inline">CO-MENTS</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkCls}>
            Comments
          </NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={linkCls}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-thread-accent px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Sign up
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-thread-muted sm:inline">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-thread-border px-3 py-2 text-sm text-thread-muted hover:border-thread-muted hover:text-white"
              >
                Log out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

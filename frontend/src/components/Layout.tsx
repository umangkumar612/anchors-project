import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-pink-500 text-white shadow-lg shadow-teal-600/20">A</span>
            Anchors
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <NavLink to="/" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-200 dark:hover:bg-teal-950 dark:hover:text-teal-200">
              Feed
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-pink-50 hover:text-pink-800 dark:text-slate-200 dark:hover:bg-pink-950 dark:hover:text-pink-200">
                  Dashboard
                </NavLink>
                <Link to="/dashboard" className="hidden items-center gap-2 rounded-full bg-slate-950 px-2 py-1 text-white hover:bg-slate-800 sm:inline-flex">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-400 text-xs font-black text-slate-950">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="pr-1">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="rounded-lg bg-slate-950 px-3 py-2 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-200 dark:hover:bg-teal-950 dark:hover:text-teal-200">
                  Login
                </NavLink>
                <NavLink to="/signup" className="rounded-lg bg-slate-950 px-3 py-2 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  Signup
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

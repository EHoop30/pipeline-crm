import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function linkClass({ isActive }: { isActive: boolean }): string {
  const base = "rounded-md px-3 py-2 text-sm font-medium";
  return isActive
    ? `${base} bg-brand-50 text-brand-700`
    : `${base} text-slate-600 hover:text-slate-900`;
}

export function Layout() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-slate-900">Pipeline CRM</span>
            <nav className="flex gap-1">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/board" className={linkClass}>
                Board
              </NavLink>
              <NavLink to="/deals" className={linkClass}>
                Deals
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
        Public demo workspace. Anyone can sign in, the data is shared, and it
        resets every few hours.
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

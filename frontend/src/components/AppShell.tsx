import { Activity, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';
import { Button } from './Button';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-10 items-center rounded-[10px] border-2 border-ink px-3 py-2 font-display text-xs font-bold uppercase shadow-hard ${
    isActive ? 'bg-chart-yellow text-ink' : 'bg-paper hover:bg-chart-yellow'
  }`;

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 font-display text-2xl font-bold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-ink bg-vital-red shadow-hard">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>MedEasy</span>
          </NavLink>
          <button
            type="button"
            className="pressable border-2 border-ink bg-paper p-2 shadow-hard md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className="hidden items-center gap-2 md:flex">
            {user?.role !== 'admin' ? (
              <>
                <NavLink className={navClass} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={navClass} to="/courses">
                  Courses
                </NavLink>
              </>
            ) : null}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <NavLink
              to="/profile"
              title={user?.name}
              className="pressable inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-ink bg-paper-muted shadow-hard"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </NavLink>
            <Button variant="secondary" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        </div>
        {open ? (
          <div className="grid gap-3 border-t-2 border-ink bg-paper px-4 py-4 md:hidden">
            {user?.role !== 'admin' ? (
              <>
                <NavLink className={navClass} to="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink className={navClass} to="/courses" onClick={() => setOpen(false)}>
                  Courses
                </NavLink>
              </>
            ) : null}
            <Button variant="secondary" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        ) : null}
      </header>
      <main className="w-full px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

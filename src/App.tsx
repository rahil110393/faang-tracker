import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase";
import { AuthPage } from "@/pages/AuthPage";
import { Dashboard } from "@/pages/Dashboard";
import { DaysGrid } from "@/pages/DaysGrid";
import { DayView } from "@/pages/DayView";
import { LinksPage } from "@/pages/LinksPage";

function NavBar() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded text-sm ${
      isActive ? "bg-slate-800 text-slate-50" : "text-slate-400 hover:text-slate-100"
    }`;
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-slate-50">
          FAANG Prep <span className="text-sky-400">Tracker</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>
            Dashboard
          </NavLink>
          <NavLink to="/days" className={linkCls}>
            60 Days
          </NavLink>
          <NavLink to="/links" className={linkCls}>
            Links
          </NavLink>
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-2 rounded px-3 py-1.5 text-xs text-slate-500 hover:text-slate-200"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!session) return <AuthPage />;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/days" element={<DaysGrid />} />
          <Route path="/day/:dayNumber" element={<DayView />} />
          <Route path="/links" element={<LinksPage />} />
        </Routes>
      </main>
    </div>
  );
}

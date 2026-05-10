import { useState } from "react";
import { Link } from "react-router-dom";
import { useLinks } from "@/hooks/useLinks";
import type { LinkType, Track } from "@/lib/database.types";

const TYPE_ICON: Record<LinkType, string> = {
  leetcode: "🟧",
  youtube: "▶️",
  article: "📄",
  note: "📝",
  other: "🔗",
};

export function LinksPage() {
  const { data: links = [], isLoading } = useLinks();
  const [typeFilter, setTypeFilter] = useState<LinkType | "all">("all");
  const [trackFilter, setTrackFilter] = useState<Track | "all">("all");

  const filtered = links.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (trackFilter !== "all" && l.track !== trackFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-50">All Links</h1>

      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LinkType | "all")}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800"
        >
          <option value="all">All types</option>
          <option value="leetcode">🟧 LeetCode</option>
          <option value="youtube">▶️ YouTube</option>
          <option value="article">📄 Article</option>
          <option value="note">📝 Note</option>
          <option value="other">🔗 Other</option>
        </select>
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value as Track | "all")}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800"
        >
          <option value="all">All tracks</option>
          <option value="DSA">DSA</option>
          <option value="DESIGN">Design</option>
          <option value="BEHAVIORAL">Behavioral</option>
        </select>
      </div>

      {isLoading && <div className="text-slate-400">Loading…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-lg bg-slate-900 p-6 text-sm text-slate-400 ring-1 ring-slate-800">
          No links yet. Add some from a Day view.
        </div>
      )}

      <ul className="space-y-2">
        {filtered.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800"
          >
            <span className="text-lg">{TYPE_ICON[l.type]}</span>
            <div className="flex-1 min-w-0">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-sky-300 hover:underline"
              >
                {l.label}
              </a>
              <div className="text-xs text-slate-500 truncate">{l.url}</div>
            </div>
            <Link
              to={`/day/${l.day_number}`}
              className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              Day {l.day_number}
              {l.track && <span className="ml-1 text-slate-500">· {l.track}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";
import { useAddLink, useDeleteLink, useLinks } from "@/hooks/useLinks";
import type { LinkType, Track } from "@/lib/database.types";

const TYPE_OPTIONS: { value: LinkType; label: string; icon: string }[] = [
  { value: "leetcode", label: "LeetCode", icon: "🟧" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "article", label: "Article", icon: "📄" },
  { value: "note", label: "Note", icon: "📝" },
  { value: "other", label: "Other", icon: "🔗" },
];

const ICON: Record<LinkType, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.icon]),
) as Record<LinkType, string>;

export function LinkManager({ day, track }: { day: number; track: Track | null }) {
  const { data: allLinks = [] } = useLinks(day);
  const links = allLinks.filter((l) => (track === null ? l.track === null : l.track === track));
  const addLink = useAddLink();
  const deleteLink = useDeleteLink();

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<LinkType>("leetcode");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !label.trim()) return;
    await addLink.mutateAsync({ day_number: day, track, url: url.trim(), label: label.trim(), type });
    setUrl("");
    setLabel("");
    setOpen(false);
  }

  return (
    <div>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-2 rounded-md bg-slate-950/60 px-2 py-1.5 ring-1 ring-slate-800"
          >
            <span>{ICON[l.type]}</span>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate text-sm text-sky-300 hover:underline"
            >
              {l.label}
            </a>
            <button
              onClick={() => deleteLink.mutate(l.id)}
              className="text-xs text-slate-500 hover:text-red-400"
              aria-label="Delete link"
            >
              ✕
            </button>
          </li>
        ))}
        {links.length === 0 && (
          <li className="text-xs text-slate-500">No links yet.</li>
        )}
      </ul>

      {open ? (
        <form onSubmit={submit} className="mt-2 grid grid-cols-1 gap-2 rounded-md bg-slate-950/60 p-2 ring-1 ring-slate-800">
          <input
            placeholder="Label (e.g. Two Sum)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded bg-slate-900 px-2 py-1 text-sm ring-1 ring-slate-700 focus:ring-sky-500"
          />
          <input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded bg-slate-900 px-2 py-1 text-sm ring-1 ring-slate-700 focus:ring-sky-500"
          />
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LinkType)}
              className="rounded bg-slate-900 px-2 py-1 text-sm ring-1 ring-slate-700"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.icon} {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={addLink.isPending}
              className="rounded bg-sky-600 px-3 py-1 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 text-xs text-sky-400 hover:text-sky-300"
        >
          + Add link
        </button>
      )}
    </div>
  );
}

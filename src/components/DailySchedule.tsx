import { Link } from "react-router-dom";
import { PLAN, PHASE_META } from "@/data/plan-seed";

type SlotType = "study" | "break" | "office";
type SlotTrack = "DSA" | "Design" | "Behavioral" | "Mock";
type ContentKey = "dsa" | "design" | "behavioral";

interface TimeSlot {
  start: string;
  end: string;
  label: string;
  type: SlotType;
  track?: SlotTrack;
  durationHrs: number;
  hint?: string;
  // Which parts of the day's plan to surface in this block.
  contentKeys?: ContentKey[];
}

const WEEKDAY_SLOTS: TimeSlot[] = [
  {
    start: "06:30",
    end: "09:30",
    label: "Morning Session",
    type: "study",
    track: "DSA",
    durationHrs: 3,
    hint: "Freshest mind — hardest problems first. 25 min time-box each.",
    contentKeys: ["dsa"],
  },
  {
    start: "09:30",
    end: "10:00",
    label: "Breakfast",
    type: "break",
    durationHrs: 0.5,
    hint: "Eat properly. Don't skip — you have a long day.",
  },
  {
    start: "10:00",
    end: "19:00",
    label: "Office",
    type: "office",
    durationHrs: 9,
    hint: "Locked. Lunch break in here — rest your eyes.",
  },
  {
    start: "19:00",
    end: "19:45",
    label: "Dinner",
    type: "break",
    durationHrs: 0.75,
    hint: "Wind down from work. Reset before the evening block.",
  },
  {
    start: "19:45",
    end: "21:30",
    label: "Evening Session",
    type: "study",
    track: "Design",
    durationHrs: 1.75,
    hint: "Lighter but focused — System Design notes, then Behavioral prep.",
    contentKeys: ["design", "behavioral"],
  },
];

const WEEKEND_SLOTS: TimeSlot[] = [
  {
    start: "08:00",
    end: "08:30",
    label: "Breakfast",
    type: "break",
    durationHrs: 0.5,
    hint: "Fuel up. Weekends are where you pull ahead.",
  },
  {
    start: "08:30",
    end: "11:00",
    label: "Deep DSA",
    type: "study",
    track: "DSA",
    durationHrs: 2.5,
    hint: "Hard problems and pattern consolidation. No rush, go deep.",
    contentKeys: ["dsa"],
  },
  {
    start: "11:00",
    end: "12:30",
    label: "System Design",
    type: "study",
    track: "Design",
    durationHrs: 1.5,
    hint: "Whiteboard the full design — reqs, capacity, API, schema, scaling.",
    contentKeys: ["design"],
  },
  {
    start: "12:30",
    end: "13:30",
    label: "Lunch",
    type: "break",
    durationHrs: 1,
    hint: "Step away from the screen. Walk if you can.",
  },
  {
    start: "13:30",
    end: "15:30",
    label: "Behavioral + Review",
    type: "study",
    track: "Behavioral",
    durationHrs: 2,
    hint: "STAR story practice and review of the week's problems.",
    contentKeys: ["behavioral"],
  },
  {
    start: "15:30",
    end: "16:00",
    label: "Tea Break",
    type: "break",
    durationHrs: 0.5,
    hint: "Short reset before the final push.",
  },
  {
    start: "16:00",
    end: "18:00",
    label: "Mock / Weak Areas",
    type: "study",
    track: "Mock",
    durationHrs: 2,
    hint: "Pramp / Interviewing.io, or drill your single weakest topic.",
  },
  {
    start: "19:00",
    end: "19:45",
    label: "Dinner",
    type: "break",
    durationHrs: 0.75,
    hint: "Done for the day. Rest — consistency beats burnout.",
  },
];

const TRACK_BORDER: Record<SlotTrack, string> = {
  DSA: "border-l-blue-500",
  Design: "border-l-purple-500",
  Behavioral: "border-l-emerald-500",
  Mock: "border-l-amber-500",
};

const TRACK_BADGE: Record<SlotTrack, string> = {
  DSA: "bg-blue-500/10 text-blue-400",
  Design: "bg-purple-500/10 text-purple-400",
  Behavioral: "bg-emerald-500/10 text-emerald-400",
  Mock: "bg-amber-500/10 text-amber-400",
};

const CONTENT_LABEL: Record<ContentKey, string> = {
  dsa: "DSA",
  design: "Design",
  behavioral: "Behavioral",
};

// Maps a content key to the Track anchor id used on the DayView page.
const CONTENT_ANCHOR: Record<ContentKey, string> = {
  dsa: "DSA",
  design: "DESIGN",
  behavioral: "BEHAVIORAL",
};

interface PlanDayContent {
  dsa: string;
  design: string;
  behavioral: string;
}

function SlotCard({
  slot,
  planContent,
  planDayNumber,
}: {
  slot: TimeSlot;
  planContent: PlanDayContent;
  planDayNumber: number;
}) {
  const isOffice = slot.type === "office";
  const isBreak = slot.type === "break";

  const borderCls = isOffice
    ? "border-l-slate-700"
    : isBreak
    ? "border-l-slate-600"
    : slot.track
    ? TRACK_BORDER[slot.track]
    : "border-l-slate-600";

  // Today's actual plan tasks for this block, pulled from the 60-day plan.
  const tasks = (slot.contentKeys ?? []).map((key) => ({
    key,
    label: CONTENT_LABEL[key],
    text: planContent[key],
  }));

  return (
    <div
      className={`rounded-lg bg-slate-900 border-l-4 px-4 py-3 ring-1 ring-slate-800 ${borderCls} ${
        isOffice ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
            {slot.start}–{slot.end}
          </span>
          <span
            className={`text-sm font-semibold truncate ${
              isOffice || isBreak ? "text-slate-400" : "text-slate-100"
            }`}
          >
            {slot.label}
            {isOffice && <span className="ml-1 text-slate-600 text-xs">🔒</span>}
            {isBreak && <span className="ml-1 text-xs">🍽️</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {slot.track && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${TRACK_BADGE[slot.track]}`}
            >
              {slot.track}
            </span>
          )}
          <span className="text-xs text-slate-500">{slot.durationHrs}h</span>
        </div>
      </div>

      {slot.hint && (
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{slot.hint}</p>
      )}

      {tasks.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {tasks.map((task) => (
            <li key={task.key}>
              <Link
                to={`/day/${planDayNumber}#${CONTENT_ANCHOR[task.key]}`}
                className="group block rounded-md px-2 py-1.5 -mx-2 text-sm leading-relaxed text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
              >
                <span className="font-semibold text-slate-400 group-hover:text-sky-400">
                  {task.label}:
                </span>{" "}
                {task.text}
                <span className="ml-1 whitespace-nowrap text-xs text-sky-500 opacity-0 transition group-hover:opacity-100">
                  open ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Study blocks with no track content (e.g. Mock) still link to the day. */}
      {slot.type === "study" && tasks.length === 0 && (
        <Link
          to={`/day/${planDayNumber}`}
          className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300"
        >
          Open Day {planDayNumber} to attach resources ↗
        </Link>
      )}
    </div>
  );
}

interface DailyScheduleProps {
  isWeekend: boolean;
  currentPlanDay: number;
  viewedDate: Date;
  relativeLabel: string;
}

export function DailySchedule({
  isWeekend,
  currentPlanDay,
  viewedDate,
  relativeLabel,
}: DailyScheduleProps) {
  const slots = isWeekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  const dayLabel = isWeekend ? "Weekend" : "Weekday";

  // Look up the actual plan for the viewed day (PLAN is 1-indexed by day).
  const planIndex = Math.min(Math.max(currentPlanDay - 1, 0), PLAN.length - 1);
  const planDay = PLAN[planIndex];
  const phaseMeta = PHASE_META[planDay.phase];

  const studyHours = slots
    .filter((s) => s.type === "study")
    .reduce((sum, s) => sum + s.durationHrs, 0);

  // Explicit "which day am I looking at" label so the weekday/weekend split is never ambiguous.
  const dateLabel = viewedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {relativeLabel} — {dateLabel}
          </div>
          <div className="mt-0.5 text-sm font-bold text-slate-100">
            {dayLabel} schedule
            <span className="text-slate-500 font-normal"> · Plan Day {planDay.day}</span>
          </div>
        </div>
        <span className="text-xs text-slate-500">{studyHours}h study time</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        <span className="text-slate-400 font-medium">{phaseMeta.label}</span> —{" "}
        {phaseMeta.tagline}
      </p>
      <div className="space-y-2">
        {slots.map((slot) => (
          <SlotCard
            key={`${slot.start}-${slot.label}`}
            slot={slot}
            planContent={planDay}
            planDayNumber={planDay.day}
          />
        ))}
      </div>
    </div>
  );
}

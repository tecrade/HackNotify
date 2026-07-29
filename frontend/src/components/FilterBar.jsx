import { REGIONS, MODES, TYPES } from "../data/taxonomy";

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/60"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5",
              active
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
            ].join(" ")}
          >
            {opt.dot && (
              <span className={`h-1.5 w-1.5 rounded-full ${opt.dot} ${active ? "bg-white" : ""}`} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterBar({ filters, setFilters, search, setSearch }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-md bg-white/85 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex flex-col gap-3">
        {/* Search input with search icon */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, theme, location or organizer…"
            aria-label="Search hackathons"
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <Segmented
            ariaLabel="Filter by region"
            options={REGIONS}
            value={filters.region}
            onChange={(v) => setFilters((f) => ({ ...f, region: v }))}
          />
          <Segmented
            ariaLabel="Filter by mode"
            options={MODES}
            value={filters.mode}
            onChange={(v) => setFilters((f) => ({ ...f, mode: v }))}
          />
          <Segmented
            ariaLabel="Filter by hackathon type"
            options={TYPES}
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
          />
        </div>
      </div>
    </div>
  );
}

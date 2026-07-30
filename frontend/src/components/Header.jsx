export default function Header({ total, lastUpdated, stats }) {
  const formatted = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-slate-50/50 to-slate-50 border-b border-slate-200/80">
      {/* Decorative floating background glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-floatSlow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-floatSlow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-light-grid bg-grid opacity-30"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-10">
        {/* Live tracker status pill */}
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-indigo-700 uppercase bg-white/80 backdrop-blur-sm border border-indigo-100 px-3.5 py-1.5 rounded-full shadow-xs mb-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 animate-pulseDot" />
          </span>
          Live Hackathon Tracker · updated {formatted}
        </div>

        {/* Title & Description */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight text-balance max-w-3xl">
          Every hackathon worth building for,{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
            all in one place.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">
          An automated tracker monitoring Kerala, India, and global developer portals.
          Real-time AI data extraction — no dead links.
        </p>

        {/* Metrics Row */}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-body">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-card flex items-center gap-3">
            <span className="text-2xl font-bold font-display text-indigo-600">{total}</span>
            <span className="text-slate-600 font-medium text-xs">Active Hackathons</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-card flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700">Kerala:</span>
              <span className="font-bold text-slate-900">{stats?.kerala || 0}</span>
            </div>
            <div className="h-3.5 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-slate-700">India:</span>
              <span className="font-bold text-slate-900">{stats?.india || 0}</span>
            </div>
            <div className="h-3.5 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-slate-700">Global:</span>
              <span className="font-bold text-slate-900">{stats?.global || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

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
        {/* Top row: Live status pill + GitHub link */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Live tracker status pill */}
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-indigo-700 uppercase bg-white/80 backdrop-blur-sm border border-indigo-100 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 animate-pulseDot" />
            </span>
            Live Hackathon Tracker · updated {formatted}
          </div>

          {/* GitHub Contribute Button */}
          <a
            href="https://github.com/tecrade/HackNotify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-700 bg-white/90 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3.5 py-1.5 rounded-full shadow-xs transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Contributions welcome
          </a>
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
          Real-time AI data extraction — no manual updates, no dead links.
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

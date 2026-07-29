import { REGION_DOT, REGION_BADGE, REGION_LABEL } from "../data/taxonomy";

const MODE_STYLES = {
  online: "text-sky-700 border-sky-200 bg-sky-50/80",
  offline: "text-rose-700 border-rose-200 bg-rose-50/80",
  hybrid: "text-purple-700 border-purple-200 bg-purple-50/80",
};

export default function HackathonCard({ h }) {
  const modeKey = (h.mode || "offline").toLowerCase();
  const regionKey = (h.region || "india").toLowerCase();

  return (
    <article className="group relative rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm p-6 flex flex-col gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300">
      {/* Card Header: Region & Mode */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            REGION_BADGE[regionKey] || REGION_BADGE.india
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${REGION_DOT[regionKey] || REGION_DOT.india}`} />
          {REGION_LABEL[regionKey] || "India"}
        </div>
        <span
          className={`text-[11px] font-mono font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            MODE_STYLES[modeKey] || MODE_STYLES.offline
          }`}
        >
          {h.mode}
        </span>
      </div>

      {/* Title & Organizer */}
      <div>
        <h3 className="font-display text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {h.title}
        </h3>
        {h.organizer && (
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <span className="text-slate-400">by</span> {h.organizer}
          </p>
        )}
      </div>

      {/* Grid Specs */}
      <dl className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
        <div>
          <dt className="text-slate-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date
          </dt>
          <dd className="text-slate-700 font-medium mt-1 truncate">{h.date || "TBA"}</dd>
        </div>

        <div>
          <dt className="text-slate-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Venue
          </dt>
          <dd className="text-slate-700 font-medium mt-1 truncate">{h.venue || "—"}</dd>
        </div>

        <div>
          <dt className="text-slate-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prize Pool
          </dt>
          <dd className="text-emerald-700 font-semibold font-mono mt-1 truncate">
            {h.prize_pool || "Not specified"}
          </dd>
        </div>

        <div>
          <dt className="text-slate-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Team Size
          </dt>
          <dd className="text-slate-700 font-medium mt-1 truncate">{h.max_participants || "Not specified"}</dd>
        </div>
      </dl>

      {/* Theme Tags */}
      {h.theme && (
        <div className="flex flex-wrap gap-1.5">
          {h.theme
            .split(",")
            .slice(0, 3)
            .map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200/60"
              >
                {t.strip ? t.strip() : t.trim()}
              </span>
            ))}
        </div>
      )}

      {/* Card Footer: Type & Register CTA */}
      <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-slate-100">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {h.hackathon_type || "Software"}
        </span>

        {h.registration_url ? (
          <a
            href={h.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-200 transition-all duration-200 group/btn"
          >
            <span>Register</span>
            <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
            TBA
          </span>
        )}
      </div>
    </article>
  );
}

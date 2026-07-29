import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import HackathonCard from "./components/HackathonCard";
import EmptyState from "./components/EmptyState";

const DATA_URL = `${import.meta.env.BASE_URL}data/hackathons.json`;

export default function App() {
  const [data, setData] = useState({ hackathons: [], total: 0, last_updated: null });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ region: "all", mode: "all", type: "all" });

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Compute region counts for hero banner
  const stats = useMemo(() => {
    const list = data.hackathons || [];
    return {
      kerala: list.filter((h) => h.region === "kerala").length,
      india: list.filter((h) => h.region === "india").length,
      global: list.filter((h) => h.region === "global").length,
    };
  }, [data]);

  // Filter hackathons
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.hackathons || []).filter((h) => {
      if (filters.region !== "all" && h.region !== filters.region) return false;
      if (filters.mode !== "all" && h.mode !== filters.mode) return false;
      if (filters.type !== "all" && h.hackathon_type !== filters.type) return false;
      if (q) {
        const hay = `${h.title} ${h.theme} ${h.organizer} ${h.venue}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, filters, search]);

  const resetFilters = () => {
    setFilters({ region: "all", mode: "all", type: "all" });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-body selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Header Hero Section */}
      <Header total={data.total || (data.hackathons ? data.hackathons.length : 0)} lastUpdated={data.last_updated} stats={stats} />

      {/* Filter Bar */}
      <FilterBar filters={filters} setFilters={setFilters} search={search} setSearch={setSearch} />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Loading Skeletons */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card animate-pulse flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="mt-auto h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-card my-12">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Hackathon Feed Offline</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Could not load hackathon listings from <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">frontend/public/data/hackathons.json</code>.
            </p>
          </div>
        )}

        {/* Empty State */}
        {status === "ready" && filtered.length === 0 && <EmptyState onReset={resetFilters} />}

        {/* Hackathon Cards Grid */}
        {status === "ready" && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h, i) => (
              <HackathonCard key={`${h.title}-${h.date}-${i}`} h={h} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-sm text-slate-600 font-body flex items-center justify-center gap-1.5 flex-wrap">
        <span>Made with</span>
        <svg className="w-4 h-4 text-rose-500 fill-current inline-block animate-pulse" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>by</span>
        <a
          href="https://tecrade.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 decoration-indigo-500 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Tecrade
        </a>
      </footer>
    </div>
  );
}

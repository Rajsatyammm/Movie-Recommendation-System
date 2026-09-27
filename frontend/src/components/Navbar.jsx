import { Search, Film, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ onSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    onSearch(query.trim());
    setMobileOpen(false);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-purple-600 shadow-lg shadow-red-500/20">
            <Film size={20} />
          </div>

          <span className="text-xl font-black tracking-tight">
            Cine<span className="text-red-500">Match</span>
          </span>
        </button>

        {/* Desktop search */}
        <form
          onSubmit={handleSubmit}
          className="mx-8 hidden max-w-xl flex-1 md:block"
        >
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-500/50 focus:bg-white/10"
            />
          </div>
        </form>

        <div className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
          <button className="transition hover:text-white">Home</button>
          <button
            onClick={() =>
              document
                .getElementById("trending")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="transition hover:text-white"
          >
            Trending
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-300 md:hidden"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black px-5 py-5 md:hidden">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 outline-none focus:border-red-500/50"
              />
            </div>
          </form>

          <div className="mt-5 flex gap-5 text-sm text-gray-300">
            <button>Home</button>
            <button
              onClick={() => {
                setMobileOpen(false);
                document
                  .getElementById("trending")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Trending
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

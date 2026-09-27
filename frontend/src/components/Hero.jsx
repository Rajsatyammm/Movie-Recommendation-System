import { Play, Search, Sparkles } from "lucide-react";
import React from "react";

export default function Hero({ onSearch }) {
  const [query, setQuery] = React.useState("");

  const submit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="relative min-h-[680px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.28),transparent_30%),radial-gradient(circle_at_20%_70%,rgba(220,38,38,0.18),transparent_35%),linear-gradient(180deg,#090909_0%,#090909_45%,#050505_100%)]" />

      {/* Cinematic glow */}
      <div className="absolute right-[-15%] top-[10%] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[120px]" />

      <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-red-700/10 blur-[120px]" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 pt-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
            <Sparkles size={15} className="text-red-400" />
            Personalized movie recommendations
          </div>

          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
            Find your next
            <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              favorite movie.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
            Discover trending movies, explore popular titles, and get
            recommendations based on the movies you already love.
          </p>

          <form onSubmit={submit} className="mt-9 max-w-2xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl sm:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="text-gray-500" size={20} />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What movie are you looking for?"
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <button className="rounded-xl bg-gradient-to-r from-red-600 to-purple-600 px-7 py-3 font-semibold transition hover:scale-[1.02] hover:shadow-xl hover:shadow-red-600/20">
                Search
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Inception", "Interstellar", "The Dark Knight"].map((movie) => (
              <button
                key={movie}
                onClick={() => onSearch(movie)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {movie}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
    </section>
  );
}

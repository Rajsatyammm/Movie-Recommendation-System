import { Star, Play } from "lucide-react";

export default function MovieCard({ movie, onClick }) {
  return (
    <button
      onClick={() => onClick(movie)}
      className="movie-card group relative min-w-[170px] max-w-[190px] flex-shrink-0 overflow-hidden rounded-2xl bg-white/5 text-left sm:min-w-[190px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-900 text-gray-600">
            No Poster
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl">
            <Play size={19} fill="currentColor" />
          </div>
        </div>

        {/* Rating */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          <Star size={12} fill="#facc15" className="text-yellow-400" />
          {(movie.vote_average ?? 0).toFixed(1)}
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">
          {movie.title}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {movie.release_date?.slice(0, 4) || "Unknown"}
        </p>
      </div>
    </button>
  );
}

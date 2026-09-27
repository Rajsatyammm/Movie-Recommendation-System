import { ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

export default function MovieRow({
  id,
  title,
  movies,
  loading,
  onMovieClick,
}) {
  return (
    <section id={id} className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>

        <button className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-white">
          View all
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
        {loading
          ? Array.from({ length: 7 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : movies?.map((movie) => (
              <MovieCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={onMovieClick}
              />
            ))}
      </div>
    </section>
  );
}

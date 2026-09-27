import { useEffect, useState } from "react";
import {
  X,
  Star,
  Calendar,
  Sparkles,
  LoaderCircle,
} from "lucide-react";

import { getMovieBundle, getMovieDetails } from "../services/api";
import MovieCard from "./MovieCard";

export default function MovieModal({ movie, onClose, onMovieClick }) {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;

    const load = async () => {
      try {
        setLoading(true);
        const response = await getMovieDetails(movie.tmdb_id);
        console.log("getMovieDetails: ", response);

        if (response.status) {
          setBundle(response.data);
        }
      } catch (error) {
        console.error("Failed to load movie:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movie]);

  useEffect(() => {
    document.body.style.overflow = movie ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  if (!movie) return null;

  const details = bundle || movie;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] shadow-2xl"
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute right-5 top-5 z-20">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white hover:text-black"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative min-h-[360px] overflow-hidden">
            {details.backdrop_url ? (
              <img
                src={details.backdrop_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm"
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-black/50 to-black/20" />

            <div className="relative flex min-h-[360px] items-end gap-6 p-6 sm:p-10">
              <div className="hidden w-40 flex-shrink-0 overflow-hidden rounded-xl shadow-2xl sm:block">
                {details.poster_url && (
                  <img
                    src={details.poster_url}
                    alt={details.title}
                    className="w-full"
                  />
                )}
              </div>

              <div className="max-w-2xl">
                <div className="mb-3 flex flex-wrap gap-2">
                  {details.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-gray-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <h2 className="text-3xl font-black sm:text-5xl">
                  {details.title}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star
                      size={15}
                      fill="#facc15"
                      className="text-yellow-400"
                    />
                    {movie.vote_average?.toFixed(1)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar size={15} />
                    {details.release_date || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10">
          <h3 className="mb-3 text-lg font-bold">Overview</h3>

          <p className="max-w-4xl leading-7 text-gray-400">
            {details.overview || "No overview available for this movie."}
          </p>

          {/* Recommendations */}
          {loading ? (
            <div className="mt-12 flex items-center gap-3 text-gray-500">
              <LoaderCircle className="animate-spin" size={20} />
              Finding similar movies...
            </div>
          ) : (
            <>
              {bundle?.tfidf_recommendations?.length > 0 && (
                <section className="mt-12">
                  <div className="mb-5 flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={20} />
                    <h3 className="text-xl font-bold">
                      Because you liked this
                    </h3>
                  </div>

                  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
                    {bundle.tfidf_recommendations.map((item) => (
                      <MovieCard
                        key={item.tmdb_id}
                        movie={item}
                        onClick={onMovieClick}
                      />
                    ))}
                  </div>
                </section>
              )}

              {bundle?.genre_recommendations?.length > 0 && (
                <section className="mt-10">
                  <h3 className="mb-5 text-xl font-bold">
                    More from this genre
                  </h3>

                  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
                    {bundle.genre_recommendations.map((item) => (
                      <MovieCard
                        key={item.tmdb_id}
                        movie={item}
                        onClick={onMovieClick}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Search, X } from "lucide-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import MovieModal from "./components/MovieModal";

import {
  getMovies,
  searchMovies,
} from "./services/api";

export default function App() {
  const [movies, setMovies] = useState({
    trending: [],
    popular: [],
    top_rated: [],
    upcoming: [],
    now_playing: [],
  });

  const [loading, setLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
  setLoading(true);

  const categories = [
    "trending",
    "popular",
    "top_rated",
    "upcoming",
    "now_playing",
  ];

  const nextMovies = {};

  await Promise.all(
    categories.map(async (category) => {
      try {
        const response = await getMovies(category, 20);

        nextMovies[category] = response?.data || [];
      } catch (error) {
        console.error(
          `Failed to load ${category}:`,
          error
        );

        nextMovies[category] = [];
      }

      setMovies((current) => ({
        ...current,
        [category]: nextMovies[category] || [],
      }));
    })
  );

  setLoading(false);
  };


  const performSearch = async (query) => {
    try {
      setSearchQuery(query);
      setSearchLoading(true);
      setSearchError("");

      const response = await searchMovies(query);

      if (!response.status) {
        throw new Error(response.message || "Search failed");
      }

      setSearchResults(response.data?.results || []);

      setTimeout(() => {
        document
          .getElementById("search-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error(error);

      setSearchResults([]);
      setSearchError(
        error.response?.data?.detail ||
          error.message ||
          "Unable to search movies."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar onSearch={performSearch} />

      {!searchQuery && <Hero onSearch={performSearch} />}

      <main className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        {/* Search results */}
        {searchQuery && (
          <section
            id="search-results"
            className="mb-16 scroll-mt-24 pt-28"
          >
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-sm text-red-400">SEARCH RESULTS</p>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Results for "{searchQuery}"
                </h1>
              </div>

              <button
                onClick={clearSearch}
                className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
                Clear search
              </button>
            </div>

            {searchLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-500">
                <LoaderCircle
                  size={28}
                  className="mr-3 animate-spin"
                />
                Searching...
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="mb-4 text-red-400" size={40} />

                <h2 className="text-xl font-bold">
                  Something went wrong
                </h2>

                <p className="mt-2 text-gray-500">{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search
                  size={40}
                  className="mb-4 text-gray-600"
                />

                <h2 className="text-xl font-bold">
                  No movies found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try searching for another movie.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {searchResults.map((movie) => (
                  <div
                    key={movie.tmdb_id}
                    className="min-w-0"
                  >
                    <MovieCard
                      movie={movie}
                      onClick={setSelectedMovie}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Home */}
        {!searchQuery && (
          <>
            <MovieRow
              id="trending"
              title="Trending This Week"
              movies={movies.trending}
              loading={loading}
              onMovieClick={setSelectedMovie}
            />

            <MovieRow
              title="Popular Movies"
              movies={movies.popular}
              loading={loading}
              onMovieClick={setSelectedMovie}
            />

            <MovieRow
              title="Top Rated"
              movies={movies.top_rated}
              loading={loading}
              onMovieClick={setSelectedMovie}
            />

            <MovieRow
              title="Now Playing"
              movies={movies.now_playing}
              loading={loading}
              onMovieClick={setSelectedMovie}
            />

            <MovieRow
              title="Coming Soon"
              movies={movies.upcoming}
              loading={loading}
              onMovieClick={setSelectedMovie}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} CineMatch
          </p>

          <p>
            Movie discovery powered by your recommendation engine.
          </p>
        </div>
      </footer>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onMovieClick={setSelectedMovie}
      />
    </div>
  );
}

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 15000,
});

export const getMovies = async (category = "popular", limit = 20) => {
  const response = await API.get("/home", {
    params: {
      category,
      limit,
    },
  });

  return response.data;
};

export const searchMovies = async (query, page = 1) => {
  const response = await API.get("/search", {
    params: {
      query,
      page,
    },
  });

  return response.data;
};

export const getMovie = async (movieId) => {
  const response = await API.get(`/movie/${movieId}`);
  return response.data;
};

export const getMovieBundle = async (title, limit = 10) => {
  const response = await API.get("/movie/search", {
    params: {
      title,
      limit,
    },
  });

  console.log("Movie Bundle Response: ". response.data)

  return response.data;
};

export const getMovieDetails = async (movieId) => {
  const response = await API.get(`/movie-details/${movieId}`);
  console.log("Movie getMovieDetails: ". response)
  return response.data;
};

export const getRecommendations = async (title, limit = 10) => {
  const response = await API.get("/recommend/tfidf", {
    params: {
      title,
      limit,
    },
  });

  return response.data;
};

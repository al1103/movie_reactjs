/**
 * API Client for Movie API
 * Base URL: http://localhost:3000 (có thể cấu hình qua env)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Utility function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

/**
 * Movie APIs
 */
export const movieApi = {
  // Get latest movies
  getLatestMovies: (page = 1, version = "v1") =>
    apiCall(`/api/movies/new?page=${page}&version=${version}`),

  // Get movie by slug
  getMovieBySlug: (slug) => apiCall(`/api/movies/${slug}`),

  // Get movie by TMDB
  getMovieByTMDB: (type, tmdbId) =>
    apiCall(`/api/movies/tmdb/${type}/${tmdbId}`),

  // Search movies
  searchMovies: (keyword, page = 1, limit = 10) =>
    apiCall(`/api/search?keyword=${keyword}&page=${page}&limit=${limit}`),
};

/**
 * Collection APIs
 */
export const collectionApi = {
  // Get collections with filtering and pagination
  getCollections: (typeList, page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      type_list: typeList,
      page,
      limit,
      ...filters,
    });
    return apiCall(`/api/collections?${params.toString()}`);
  },

  // Get series (phim-bo)
  getSeries: (page = 1) =>
    apiCall(`/api/collections?type_list=phim-bo&page=${page}`),

  // Get movies (phim-le)
  getMovies: (page = 1) =>
    apiCall(`/api/collections?type_list=phim-le&page=${page}`),

  // Get animations (hoat-hinh)
  getAnimations: (page = 1) =>
    apiCall(`/api/collections?type_list=hoat-hinh&page=${page}`),

  // Get TV shows
  getTVShows: (page = 1) =>
    apiCall(`/api/collections?type_list=tv-shows&page=${page}`),

  // Get Vietnamese dubbed (phim-vietsub)
  getVietsubMovies: (page = 1) =>
    apiCall(`/api/collections?type_list=phim-vietsub&page=${page}`),

  // Get Thai dubbed (phim-thuyet-minh)
  getThaiDubbed: (page = 1) =>
    apiCall(`/api/collections?type_list=phim-thuyet-minh&page=${page}`),

  // Get multi-language (phim-long-tieng)
  getMultiLanguage: (page = 1) =>
    apiCall(`/api/collections?type_list=phim-long-tieng&page=${page}`),
};

/**
 * Genre APIs
 */
export const genreApi = {
  // Get all genres
  getAllGenres: () => apiCall("/api/genres"),

  // Get genre details with movies
  getGenreDetails: (slug, page = 1, limit = 10) =>
    apiCall(`/api/genres/${slug}?page=${page}&limit=${limit}`),
};

/**
 * Country APIs
 */
export const countryApi = {
  // Get all countries
  getAllCountries: () => apiCall("/api/countries"),

  // Get country details with movies
  getCountryDetails: (slug, page = 1, limit = 10) =>
    apiCall(`/api/countries/${slug}?page=${page}&limit=${limit}`),
};

/**
 * Year APIs
 */
export const yearApi = {
  // Get movies by year
  getMoviesByYear: (year, page = 1, limit = 10) =>
    apiCall(`/api/years/${year}?page=${page}&limit=${limit}`),
};

/**
 * Utility function to convert API response to internal format
 */
export const normalizeMovieFromAPI = (apiMovie) => ({
  id: apiMovie._id || apiMovie.id || apiMovie.slug,
  _id: apiMovie._id,
  slug: apiMovie.slug,
  title: apiMovie.name,
  origin_name: apiMovie.origin_name,
  description: apiMovie.content,
  type: apiMovie.type,
  status: apiMovie.status,
  poster: apiMovie.poster_url,
  thumb: apiMovie.thumb_url,
  banner: apiMovie.poster_url, // Using poster as banner
  is_copyright: apiMovie.is_copyright,
  sub_docquyen: apiMovie.sub_docquyen,
  chieurap: apiMovie.chieurap,
  duration: apiMovie.time,
  episode_current: apiMovie.episode_current,
  episode_total: apiMovie.episode_total,
  quality: apiMovie.quality,
  lang: apiMovie.lang,
  notify: apiMovie.notify,
  showtimes: apiMovie.showtimes,
  year: apiMovie.year,
  views: apiMovie.view || 0,
  director: apiMovie.director || [],
  actor: apiMovie.actor || [],
  category: apiMovie.category || [],
  country: apiMovie.country || [],
  tmdb: apiMovie.tmdb,
  imdb: apiMovie.imdb,
  rating: apiMovie.rating || 0,
  modified: apiMovie.modified,
  createdAt: apiMovie.createdAt,
  updatedAt: apiMovie.updatedAt,
  ratings: [],
  favorites: 0,
});

/**
 * Utility function to normalize genre from API
 */
export const normalizeGenreFromAPI = (apiGenre) => ({
  id: apiGenre._id || apiGenre.id || apiGenre.slug,
  _id: apiGenre._id,
  slug: apiGenre.slug,
  name: apiGenre.name,
  updatedAt: apiGenre.updatedAt,
});

/**
 * Utility function to normalize country from API
 */
export const normalizeCountryFromAPI = (apiCountry) => ({
  id: apiCountry.slug,
  slug: apiCountry.slug,
  name: apiCountry.name,
  updatedAt: apiCountry.updatedAt,
});

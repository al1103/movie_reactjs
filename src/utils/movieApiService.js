// MovieApiService.js - Advanced API Functions for Admin
// Các hàm helper để làm việc với API trong admin panel

import {
    collectionApi,
    countryApi,
    genreApi,
    movieApi,
    normalizeCountryFromAPI,
    normalizeGenreFromAPI,
    normalizeMovieFromAPI,
    yearApi,
} from './movieApi';

/**
 * Fetch movies theo collection type với filtering
 */
export const fetchMoviesByCollection = async (
  collectionType,
  page = 1,
  limit = 10,
  filters = {}
) => {
  try {
    const data = await collectionApi.getCollections(
      collectionType,
      page,
      limit,
      filters
    );
    return {
      movies: (data.items || []).map(normalizeMovieFromAPI),
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

/**
 * Fetch tất cả genres
 */
export const fetchAllGenres = async () => {
  try {
    const data = await genreApi.getAllGenres();
    return (data.items || data || []).map(normalizeGenreFromAPI);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

/**
 * Fetch tất cả countries
 */
export const fetchAllCountries = async () => {
  try {
    const data = await countryApi.getAllCountries();
    return (data.items || data || []).map(normalizeCountryFromAPI);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

/**
 * Fetch movies theo genre
 */
export const fetchMoviesByGenre = async (
  genreSlug,
  page = 1,
  limit = 10
) => {
  try {
    const data = await genreApi.getGenreDetails(genreSlug, page, limit);
    return {
      movies: (data.items || []).map(normalizeMovieFromAPI),
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

/**
 * Fetch movies theo country
 */
export const fetchMoviesByCountry = async (
  countrySlug,
  page = 1,
  limit = 10
) => {
  try {
    const data = await countryApi.getCountryDetails(countrySlug, page, limit);
    return {
      movies: (data.items || []).map(normalizeMovieFromAPI),
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error('Error fetching movies by country:', error);
    throw error;
  }
};

/**
 * Fetch movies theo year
 */
export const fetchMoviesByYear = async (
  year,
  page = 1,
  limit = 10
) => {
  try {
    const data = await yearApi.getMoviesByYear(year, page, limit);
    return {
      movies: (data.items || []).map(normalizeMovieFromAPI),
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error('Error fetching movies by year:', error);
    throw error;
  }
};

/**
 * Search movies
 */
export const searchMovies = async (keyword, page = 1, limit = 10) => {
  try {
    const data = await movieApi.searchMovies(keyword, page, limit);
    return {
      movies: (data.items || []).map(normalizeMovieFromAPI),
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

/**
 * Get movie detail by slug
 */
export const getMovieDetail = async (slug) => {
  try {
    const data = await movieApi.getMovieBySlug(slug);
    return normalizeMovieFromAPI(data);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    throw error;
  }
};

/**
 * Get movie by TMDB ID
 */
export const getMovieByTMDB = async (type, tmdbId) => {
  try {
    const data = await movieApi.getMovieByTMDB(type, tmdbId);
    return normalizeMovieFromAPI(data);
  } catch (error) {
    console.error('Error fetching TMDB movie:', error);
    throw error;
  }
};

/**
 * Bulk load all collection types
 * Hữu ích cho homepage
 */
export const fetchAllCollections = async () => {
  const collections = {
    phimBo: null,
    phimLe: null,
    tvShows: null,
    hoatHinh: null,
    phimVietsub: null,
    phimThuyetMinh: null,
    phimLongTieng: null,
  };

  try {
    const promises = [
      collectionApi.getSeries(1).then(d => ({ type: 'phimBo', data: d })),
      collectionApi.getMovies(1).then(d => ({ type: 'phimLe', data: d })),
      collectionApi.getTVShows(1).then(d => ({ type: 'tvShows', data: d })),
      collectionApi.getAnimations(1).then(d => ({ type: 'hoatHinh', data: d })),
      collectionApi.getVietsubMovies(1).then(d => ({ type: 'phimVietsub', data: d })),
      collectionApi.getThaiDubbed(1).then(d => ({ type: 'phimThuyetMinh', data: d })),
      collectionApi.getMultiLanguage(1).then(d => ({ type: 'phimLongTieng', data: d })),
    ];

    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { type, data } = result.value;
        collections[type] = {
          movies: (data.items || []).map(normalizeMovieFromAPI),
          pagination: data.pagination || {},
        };
      }
    });

    return collections;
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return collections;
  }
};

/**
 * Format movie data để hiển thị trong admin
 */
export const formatMovieForDisplay = (movie) => ({
  id: movie.id,
  slug: movie.slug,
  title: movie.title || movie.origin_name,
  year: movie.year,
  rating: (movie.rating || 0).toFixed(1),
  views: (movie.views || 0).toLocaleString('vi-VN'),
  status: movie.status,
  type: movie.type,
  genres: movie.category ? movie.category.map(c => c.name).join(', ') : 'N/A',
  countries: movie.country ? movie.country.map(c => c.name).join(', ') : 'N/A',
  poster: movie.poster,
  quality: movie.quality,
  lang: movie.lang,
});

/**
 * Build filter query string
 */
export const buildFilterQuery = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  return params.toString();
};

export default {
  fetchMoviesByCollection,
  fetchAllGenres,
  fetchAllCountries,
  fetchMoviesByGenre,
  fetchMoviesByCountry,
  fetchMoviesByYear,
  searchMovies,
  getMovieDetail,
  getMovieByTMDB,
  fetchAllCollections,
  formatMovieForDisplay,
  buildFilterQuery,
};

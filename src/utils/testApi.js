// API Connection Test Script
// Chạy: node src/utils/testApi.js (sau khi setup Node backend)

import {
    collectionApi,
    countryApi,
    genreApi,
    movieApi
} from './movieApi.js';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

console.log('🔍 API Connection Test');
console.log('='.repeat(50));
console.log(`API URL: ${API_BASE_URL}`);
console.log('='.repeat(50));

const tests = [
  {
    name: 'GET /api/movies/new',
    fn: () => movieApi.getLatestMovies(1),
  },
  {
    name: 'GET /api/collections?type_list=phim-bo',
    fn: () => collectionApi.getSeries(1),
  },
  {
    name: 'GET /api/collections?type_list=phim-le',
    fn: () => collectionApi.getMovies(1),
  },
  {
    name: 'GET /api/genres',
    fn: () => genreApi.getAllGenres(),
  },
  {
    name: 'GET /api/countries',
    fn: () => countryApi.getAllCountries(),
  },
  {
    name: 'GET /api/search?keyword=test',
    fn: () => movieApi.searchMovies('test', 1, 5),
  },
];

async function runTests() {
  for (const test of tests) {
    try {
      console.log(`\n✏️  Testing: ${test.name}`);
      const result = await test.fn();
      console.log(`✅ Success! Items: ${(result.items || result || []).length}`);
      if (result.items) {
        console.log(`   First item:`, {
          id: result.items[0]?.slug,
          name: result.items[0]?.name,
          rating: result.items[0]?.rating,
        });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

console.log('\n🚀 Starting tests...\n');
runTests();

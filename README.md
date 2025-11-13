# 🎬 Movie ReactJS - MOIVE-like Movie Portal

A modern, full-featured movie discovery application built with React, featuring integration with a movie backend API. Browse movies by collections, search, filter by genre/country, and manage your favorites.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-4.4.9-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Core Features

- **Movies Collections** - 7 collection types (Series, Movies, TV Shows, Animations, etc.)
- **Search & Discovery** - Full-text search across all movies
- **Filtering** - Filter by genre, country, year, and quality
- **User System** - Authentication, favorites, watch history
- **Ratings & Comments** - Rate and review movies locally
- **Responsive UI** - Works on desktop, tablet, and mobile

### 🔌 API Integration

- **7 Collection Types** - Phim Bộ, Phim Lẻ, TV Shows, Hoạt Hình, Vietsub, Thuyết Minh, Lồng Tiếng
- **Advanced Search** - Search by title, description, director, actor
- **Filtering** - Genre, country, year, quality filters
- **Pagination** - Smooth pagination with 10-20 items per page
- **Auto-fallback** - Falls back to sample data if API is unavailable

### 🚀 Performance

- **Lazy Loading** - Images load on demand
- **Pagination** - Prevent memory overload
- **Caching** - localStorage persistence
- **Batch Requests** - Load multiple collections in parallel
- **Code Splitting** - Vite's automatic optimizations

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Bundler**: Vite 4.4.9
- **Router**: React Router DOM 6.20.1
- **State Management**: Context API
- **Styling**: CSS3 with modern layout
- **API**: RESTful API (Fetch API)

## 📦 Installation

### Prerequisites

- Node.js 16+ or 18+
- npm or yarn

### Steps

1. **Clone or extract the project**

```bash
cd movie_reactjs
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_API=true  # Set to false for sample data
```

4. **Start development server**

```bash
npm run dev
```

Visit http://localhost:5173

## 🚀 Usage

### Quick Start

The easiest way is to follow **QUICK_START.md**:

```bash
1. Create .env file
2. Set VITE_API_URL and VITE_USE_API
3. npm install && npm run dev
```

### Homepage Features

- **Browse Collections** - Click category tabs to view different movie types
- **Featured Movie** - Highlighted movie with details
- **Grid Layout** - Movie cards with poster, rating, year
- **Search Modal** - Press search button to find movies

### Movie Details

- **Full Information** - Title, rating, genres, countries, director, actors
- **Episode Info** - For TV series
- **Ratings & Reviews** - Rate 1-5 stars and write comments
- **Add to Favorites** - Save movies to your favorites list
- **Watch History** - Automatically tracked

### User Features

- **Login/Register** - Create an account
- **My Favorites** - View saved movies
- **My History** - See watched movies
- **Profile** - Manage user settings

### Admin Panel

- **Movie Management** - View, edit, add movies
- **Genre Management** - Manage genres
- **User Management** - View user accounts
- **Statistics** - View app statistics

## 📚 Documentation

Comprehensive documentation is included:

| Document                      | Purpose                              |
| ----------------------------- | ------------------------------------ |
| **QUICK_START.md**            | 3-step setup guide                   |
| **API_INTEGRATION_GUIDE.md**  | Complete API reference with examples |
| **DATA_FLOW.md**              | Architecture & data flow diagrams    |
| **ADMIN_EXAMPLE.md**          | Admin component examples             |
| **ARCHITECTURE.md**           | System architecture overview         |
| **FAQ.md**                    | Frequently asked questions           |
| **IMPLEMENTATION_SUMMARY.md** | What was implemented                 |

## 🔗 API Endpoints

### Collections (7 Types)

```
GET /api/collections?type_list=phim-bo&page=1&limit=10
GET /api/collections?type_list=phim-le&page=1&limit=10
GET /api/collections?type_list=tv-shows&page=1&limit=10
GET /api/collections?type_list=hoat-hinh&page=1&limit=10
GET /api/collections?type_list=phim-vietsub&page=1&limit=10
GET /api/collections?type_list=phim-thuyet-minh&page=1&limit=10
GET /api/collections?type_list=phim-long-tieng&page=1&limit=10
```

### Movies

```
GET /api/movies/new?page=1&version=v1
GET /api/movies/{slug}
GET /api/movies/tmdb/{type}/{tmdbId}
```

### Search & Discovery

```
GET /api/search?keyword=keyword&page=1&limit=10
GET /api/genres
GET /api/countries
GET /api/years/{year}?page=1&limit=10
```

See **API_INTEGRATION_GUIDE.md** for full documentation.

## 🎮 Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Code Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable components
├── context/         # React Context providers
├── utils/           # API & utility functions
│   ├── movieApi.js              # Core API client
│   ├── movieApiService.js       # Service layer
│   └── storage.js               # localStorage helpers
├── data/            # Sample data
└── styles.css       # Global styles
```

## 🔒 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000    # Backend API URL
VITE_USE_API=true                     # Enable/disable API

# Optional
VITE_API_TIMEOUT=10000                # Request timeout (ms)
VITE_API_DEBUG=false                  # Enable debug mode
```

## 📊 Data Structure

Movie object from API:

```javascript
{
  slug: "movie-slug",
  name: "Movie Title",
  content: "Description...",
  type: "series",
  status: "ongoing",
  poster_url: "https://...",
  year: 2024,
  rating: 8.5,
  actor: ["Actor 1", "Actor 2"],
  director: ["Director"],
  category: [{ id: 1, name: "Action", slug: "action" }],
  country: [{ id: 1, name: "USA", slug: "usa" }]
}
```

Normalized internally to:

```javascript
{
  id: "movie-slug",
  title: "Movie Title",
  description: "Description...",
  poster: "https://...",
  // ... other fields
}
```

## 🚨 Troubleshooting

### API Not Connecting?

1. Ensure backend is running on configured port
2. Check `VITE_API_URL` in `.env`
3. View Network tab (F12) for errors
4. Try `VITE_USE_API=false` to use sample data

### Data Not Displaying?

1. Verify API response format in Network tab
2. Check console for errors (F12)
3. Verify normalization functions work
4. Check component props

### Build Issues?

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Check Node version: `node --version`

See **FAQ.md** for more Q&A.

## 🎓 Learning Resources

- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **React Router**: https://reactrouter.com
- **API Design**: https://restfulapi.net

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with React and Vite
- MOIVE design inspiration
- Community feedback

## 👨‍💻 Author

Your Name / Your Organization

## 📞 Support

For issues or questions:

1. Check **FAQ.md** first
2. Review **API_INTEGRATION_GUIDE.md**
3. Create an issue on GitHub

## 🗺️ Roadmap

- [ ] Real-time notifications
- [ ] Recommendations engine
- [ ] Social features (sharing, follows)
- [ ] Payment integration (premium content)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Advanced caching strategies

## 📈 Status

```
Version: 2.0.0 (API Integrated)
Status: Production Ready ✅
Last Updated: 2024
```

---

**Made with ❤️ using React & Vite**

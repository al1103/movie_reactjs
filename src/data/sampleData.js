export const initialGenres = [
  { id: 'g1', name: 'Hành động' },
  { id: 'g2', name: 'Tâm lý' },
  { id: 'g3', name: 'Khoa học viễn tưởng' },
  { id: 'g4', name: 'Hoạt hình' },
];

export const initialActors = [
  { id: 'a1', name: 'Chris Evans', country: 'Mỹ' },
  { id: 'a2', name: 'Scarlett Johansson', country: 'Mỹ' },
  { id: 'a3', name: 'Song Kang-ho', country: 'Hàn Quốc' },
  { id: 'a4', name: 'Tom Hanks', country: 'Mỹ' },
];

export const initialMovies = [
  {
    id: 'm1',
    title: 'Avengers: Endgame',
    description:
      'Biệt đội Avengers tiếp tục cuộc chiến chống lại Thanos để cứu vãn vũ trụ.',
    year: 2019,
    country: 'Mỹ',
    duration: 181,
    genres: ['g1', 'g3'],
    director: 'Anthony Russo, Joe Russo',
    cast: ['a1', 'a2'],
    poster:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/avengers_endgame.jpg',
    banner:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/avengers_banner.jpg',
    trailer: 'https://www.youtube.com/embed/TcMBFSGVi1c',
    rating: 4.8,
    ratings: [],
    comments: [],
    views: 523000,
  },
  {
    id: 'm2',
    title: 'Parasite',
    description:
      'Gia đình Kim xâm nhập vào gia đình giàu có Park, mở ra những bí ẩn bất ngờ.',
    year: 2019,
    country: 'Hàn Quốc',
    duration: 132,
    genres: ['g2'],
    director: 'Bong Joon-ho',
    cast: ['a3'],
    poster:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/parasite.jpg',
    banner:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/parasite_banner.jpg',
    trailer: 'https://www.youtube.com/embed/SEUXfv87Wpk',
    rating: 4.7,
    ratings: [],
    comments: [],
    views: 312000,
  },
  {
    id: 'm3',
    title: 'Toy Story 4',
    description:
      'Woody và Buzz cùng những người bạn bước vào chuyến phiêu lưu mới.',
    year: 2019,
    country: 'Mỹ',
    duration: 100,
    genres: ['g4'],
    director: 'Josh Cooley',
    cast: ['a4'],
    poster:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/toy_story4.jpg',
    banner:
      'https://res.cloudinary.com/demo/image/upload/v1692628200/toy_story4_banner.jpg',
    trailer: 'https://www.youtube.com/embed/wmiIUN-7qhE',
    rating: 4.3,
    ratings: [],
    comments: [],
    views: 201000,
  },
];

export const initialUsers = [
  {
    id: 'admin',
    email: 'admin@movie.local',
    password: 'admin123',
    role: 'admin',
    name: 'Quản trị viên',
    favorites: [],
    history: [],
  },
];

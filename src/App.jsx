import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

const AppRoutes = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

const App = () => (
  <AppDataProvider>
    <AppRoutes />
  </AppDataProvider>
);

export default App;

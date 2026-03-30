/**
 * Routes: public + protected areas with Layout
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuestsPage from './pages/QuestsPage';
import QuestPlayPage from './pages/QuestPlayPage';
import SimulationsPage from './pages/SimulationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import AchievementsPage from './pages/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';

function HomeGate() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests"
            element={
              <ProtectedRoute>
                <Layout>
                  <QuestsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests/:id/play"
            element={
              <ProtectedRoute>
                <QuestPlayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulations"
            element={
              <ProtectedRoute>
                <Layout>
                  <SimulationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Layout>
                  <ShopPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Layout>
                  <AchievementsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

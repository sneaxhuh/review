import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { PostForm } from './components/PostForm';
import { Feed } from './components/Feed';
import Profile from './pages/Profile';

const Home: React.FC = () => (
  <>
    <PostForm />
    <Feed />
  </>
);

const Layout: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Outlet />
    </main>
  </div>
);

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (!currentUser) {
    return <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
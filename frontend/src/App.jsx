import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  if (!token) {
    return <Navigate to="/auth" />;
  }

  return children;
};

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/chat" /> : <HomePage />} />
      <Route path="/auth" element={token ? <Navigate to="/chat" /> : <AuthPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { useState, useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Layout from "./component/Layout"
import Login from './component/Login'
import axios from 'axios'
import Signup from './component/Signup'
import { API_BASE_URL, normalizeUserPayload, getAuthToken, clearAllClientAuthKeys } from './config/api';

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Income = lazy(() => import("./pages/income"));
const Expense = lazy(() => import("./pages/Expense"));
const Profile = lazy(() => import("./pages/profile"));

const ProtectedRoute = ({ user, children }) => {
  const hasToken = Boolean(getAuthToken());
  if (!hasToken || !user) {
    return <Navigate to="/login" />
  }
  return children;
}

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
};

export const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      const cleanToken = tokenStr != null ? String(tokenStr).trim() : null;
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (cleanToken) localStorage.setItem("token", cleanToken);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (cleanToken) sessionStorage.setItem("token", cleanToken);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () => {
    try {
      clearAllClientAuthKeys();
    }
    catch (error) {
      console.error(error);
    }
    setUser(null);
  }

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);

    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");

    if (localToken) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (sessionToken) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const localUserRaw = localStorage.getItem("user");
        const sessionUserRaw = sessionStorage.getItem("user");
        let storedUser = null;
        try {
          storedUser = localUserRaw
            ? JSON.parse(localUserRaw)
            : sessionUserRaw
              ? JSON.parse(sessionUserRaw)
              : null;
        } catch {
          storedUser = null;
        }

        const storedToken = getAuthToken();
        const tokenFromLocal = Boolean(localStorage.getItem("token")?.trim());

        if (storedUser) {
          setUser(normalizeUserPayload(storedUser) ?? storedUser);
        }

        if (storedToken) {
          try {
            const res = await axios.get(`${API_BASE_URL}/user/me`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            const profile = normalizeUserPayload(res.data);
            if (profile) {
              persistAuth(profile, storedToken, tokenFromLocal);
            }
          } catch (fetchErr) {
            console.warn("Could not fetch profile with the stored token (try logging in again if you changed JWT_SECRET):", fetchErr);
            clearAuth();
          }
        }
      } catch (err) {
        console.error("error bootstrapping auth:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  }

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    const normalized = normalizeUserPayload(userData) ?? userData;
    persistAuth(normalized, tokenFromApi, remember);
    navigate("/");
  }

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    const normalized = normalizeUserPayload(userData) ?? userData;
    persistAuth(normalized, tokenFromApi, remember);
    navigate("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <Routes>

        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/signup' element={<Signup onSignup={handleSignup} />} />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expense" element={<Expense />} />
          <Route
            path="profile"
            element={
              <Profile
                user={user}
                onUpdateProfile={updateUserData}
                onLogout={handleLogout}
              />
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />

      </Routes>
      </Suspense>
    </>
  )
}

export default App;

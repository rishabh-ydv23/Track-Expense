import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from "./pages/Dashboard"
import Layout from "./component/Layout"
import { useState } from 'react'
import Login from './component/Login'
import Signup from './component/Signup'

const API_URL = "http://localhost:3000/api";

//to get transaction from local storage
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
};

// to protect the routes
const ProtectedRoute = ({ user, children }) => {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  const hasToken = localToken || sessionToken;
  if (!hasToken || !user) {
    return <Navigate to="/login" />
  }
  return children;
}


//to scroll to top when page gets reload orr new page



export const App = () => {
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // to save the token
  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };


  const clearAuth = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
    catch (error) {
      console.log(error);
    }
    setUser(null);
    setToken(null);
  }


  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  }

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate("/");
  }

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate("/");
  }
  return (
    <>
      <Routes>

        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/signup' element={<Signup onLogin={handleSignup} />} />
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path='/' element={<Dashboard />} />
        </Route>

      </Routes>
    </>
  )
}

export default App;
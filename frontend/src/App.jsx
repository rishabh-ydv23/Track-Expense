import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from "./pages/Dashboard"
import Layout from "./component/Layout"
import { useState } from 'react'

export const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();
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
  }

  setUser(null);
  setToken(null);



  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  }

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
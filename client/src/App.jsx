// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { useEffect } from "react";
import axios from "axios";
import api from "./utils/api";
import { loginSuccess } from "./redux/UserSlice";
import { useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const res = api.post("/api/get-user" , {
       withCredentials: true,
    })
   
      dispatch(loginSuccess(res.data))
    console.log(res.data)
  }, [])
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              
                <Dashboard />
              
            }
          />
        </Routes>
      </Router>
  );
}

export default App;
